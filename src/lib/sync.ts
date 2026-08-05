/**
 * MediSense AI — Sync Manager
 *
 * Offline-first sync dengan Yjs CRDT + y-indexeddb.
 * - Yjs untuk conflict-free resolution
 * - y-indexeddb untuk persistence offline
 * - API sync endpoint untuk cloud
 * - Background sync via Service Worker
 *
 * @see docs/TECH-STACK.md §2.5
 */

import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { getUnsyncedRecords, markSynced } from './db';

// ── Types ──────────────────────────────────────────────

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';
export type ConnectionStatus = 'online' | 'offline' | 'unknown';

export interface SyncEvent {
  type: 'sync-start' | 'sync-complete' | 'sync-error' | 'connection-change';
  status: SyncStatus;
  connectionStatus?: ConnectionStatus;
  error?: string;
  syncedCount?: number;
}

export interface TriageSyncData {
  triage_id: string;
  device_id: string;
  kader_id: string;
  patient_hash: string;
  patient_age?: number;
  patient_gender?: number;
  triage_level: 'hijau' | 'kuning' | 'merah';
  conditions: Array<{
    condition: string;
    confidence: number;
    triage_level: 'hijau' | 'kuning' | 'merah';
  }>;
  triage_started_at: string;
  triage_completed_at: string;
  model_version: string;
  app_version: string;
  voice_text?: string;
  audit_trail?: object[];
}

// ── Constants ─────────────────────────────────────────

const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 menit
const RETRY_DELAYS = [1000, 5000, 30000, 120000]; // 1s, 5s, 30s, 2m
const YJS_DOC_NAME = 'medisense-triage';
const APP_VERSION = '0.2.1';
const DEVICE_ID_KEY = 'medisense_device_id';
const KADER_ID_KEY = 'medisense_kader_id';

// ── Sync Manager Class ────────────────────────────────

class SyncManager {
  private ydoc: Y.Doc | null = null;
  private ypersistence: IndexeddbPersistence | null = null;
  private syncIntervalId: ReturnType<typeof setInterval> | null = null;
  private retryCount = 0;
  private status: SyncStatus = 'idle';
  private connectionStatus: ConnectionStatus =
    typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline';
  private listeners: Array<(event: SyncEvent) => void> = [];
  private isDestroyed = false;

  // Yjs shared types
  private triageArray: Y.Array<TriageSyncData> | null = null;

  constructor() {
    if (typeof window === 'undefined') return;

    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Listen for background sync events from Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', this.handleSWMessage);
    }
  }

  // ── Initialization ──

  /**
   * Initialize Yjs document + y-indexeddb persistence.
   * Call once at app startup.
   */
  async initialize(): Promise<void> {
    if (this.ydoc) return;
    if (typeof window === 'undefined') return;

    try {
      // Create Yjs document
      this.ydoc = new Y.Doc();

      // Create shared array for triage sessions
      this.triageArray = this.ydoc.getArray<TriageSyncData>(YJS_DOC_NAME);

      // Persist Yjs document to IndexedDB (offline-first)
      this.ypersistence = new IndexeddbPersistence(YJS_DOC_NAME, this.ydoc);

      // Wait for initial sync from IndexedDB
      await this.ypersistence.whenSynced;

      console.log(`[Sync] Yjs initialized with ${this.triageArray.length} local records`);

      // Start periodic sync
      this.startPeriodicSync();

      // Try initial sync if online
      if (this.connectionStatus === 'online') {
        this.syncNow();
      }
    } catch (error) {
      console.error('[Sync] Failed to initialize:', error);
      this.emit({ type: 'sync-error', status: 'error', error: 'Gagal inisialisasi sync' });
    }
  }

  // ── Yjs Document Management ──

  /**
   * Add triage session to Yjs document (offline-first).
   * Data otomatis persist ke y-indexeddb.
   */
  addTriageSession(session: TriageSyncData): void {
    if (!this.triageArray || !this.ydoc) {
      console.warn('[Sync] Yjs not initialized, skipping add');
      return;
    }

    this.ydoc.transact(() => {
      this.triageArray!.push([session]);
    });

    console.log(`[Sync] Added triage ${session.triage_id} to Yjs doc`);
  }

  /**
   * Get all triage sessions from Yjs document.
   */
  getLocalSessions(): TriageSyncData[] {
    if (!this.triageArray) return [];
    return this.triageArray.toArray();
  }

  /**
   * Get unsynced sessions from Yjs document.
   * In Yjs, we track sync state via a separate Y.Map.
   * For simplicity, we return all sessions and let the sync process determine what to send.
   */
  getAllSessions(): TriageSyncData[] {
    return this.getLocalSessions();
  }

  // ── Cloud Sync ──

  /**
   * Sync local Yjs data to cloud API.
   */
  async syncNow(): Promise<void> {
    if (this.status === 'syncing' || this.isDestroyed) return;
    if (this.connectionStatus !== 'online') {
      console.log('[Sync] Offline — skipping sync');
      return;
    }

    this.setStatus('syncing');
    this.emit({ type: 'sync-start', status: 'syncing' });

    try {
      const sessions = this.getAllSessions();
      if (sessions.length === 0) {
        this.setStatus('synced');
        this.emit({ type: 'sync-complete', status: 'synced', syncedCount: 0 });
        return;
      }

      // Get auth token
      const token = sessionStorage.getItem('medisense_token');
      if (!token) {
        console.log('[Sync] No auth token — skipping remote sync');
        this.setStatus('idle');
        this.emit({ type: 'sync-error', status: 'idle', error: 'Belum login — data hanya tersimpan lokal' });
        return;
      }

      // Sync each session
      let syncedCount = 0;
      let failedCount = 0;
      for (const session of sessions) {
        try {
          const response = await fetch('/api/sync/triage', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(session),
          });

          if (response.ok) {
            syncedCount++;
            // Also mark as synced in Dexie.js
            await markSynced(session.triage_id).catch(() => {});
          } else if (response.status === 409) {
            // Conflict — record already exists, skip
            syncedCount++;
            await markSynced(session.triage_id).catch(() => {});
          } else if (response.status === 401) {
            // Auth error — stop immediately
            failedCount++;
            console.warn(`[Sync] Auth error for ${session.triage_id}`);
            break;
          } else {
            failedCount++;
            console.warn(`[Sync] API error ${response.status} for ${session.triage_id}`);
          }
        } catch (err) {
          failedCount++;
          console.warn(`[Sync] Network error for ${session.triage_id}:`, err);
        }
      }

      this.retryCount = 0;

      if (failedCount > 0 && syncedCount === 0) {
        // Semua gagal
        this.setStatus('error');
        this.emit({
          type: 'sync-error',
          status: 'error',
          error: `Gagal sync ${failedCount} sesi — coba lagi nanti`,
        });
        console.warn(`[Sync] All ${failedCount} sessions failed`);
      } else if (failedCount > 0) {
        // Sebagian gagal — laporkan jangan diam saja
        this.setStatus('error');
        this.emit({
          type: 'sync-error',
          status: 'error',
          error: `${syncedCount} tersinkronasi, ${failedCount} gagal`,
          syncedCount,
        });
        console.warn(`[Sync] Partial sync: ${syncedCount} ok, ${failedCount} failed`);
      } else {
        // Semua berhasil
        this.setStatus('synced');
        this.emit({
          type: 'sync-complete',
          status: 'synced',
          syncedCount,
        });
        console.log(`[Sync] Synced ${syncedCount}/${sessions.length} sessions`);
      }
    } catch (error) {
      this.retryCount++;
      this.setStatus('error');
      this.emit({
        type: 'sync-error',
        status: 'error',
        error: `Gagal sync: ${(error as Error).message}`,
      });

      // Schedule retry with exponential backoff
      const delay = RETRY_DELAYS[Math.min(this.retryCount - 1, RETRY_DELAYS.length - 1)];
      console.log(`[Sync] Retrying in ${delay}ms (attempt ${this.retryCount})`);
      setTimeout(() => this.syncNow(), delay);
    }
  }

  /**
   * Sync pending Dexie.js records (backward compatibility).
   */
  async syncPendingDexieRecords(): Promise<number> {
    try {
      const unsynced = await getUnsyncedRecords();
      if (unsynced.length === 0) return 0;

      const token = sessionStorage.getItem('medisense_token');
      if (!token) return 0;

      let synced = 0;
      for (const record of unsynced) {
        try {
          // Parse conditions dari record lokal; fallback ke kondisi default
          // (validasi API menolak array kosong — zod min(1))
          const level = record.triageLevel as 'hijau' | 'kuning' | 'merah';
          let conditions: TriageSyncData['conditions'] = [
            { condition: 'tidak_ada', confidence: 0, triage_level: level },
          ];
          try {
            const parsed = JSON.parse(record.conditions || '[]');
            if (Array.isArray(parsed) && parsed.length > 0) {
              conditions = parsed.map((c: string) => ({
                condition: c,
                confidence: 0,
                triage_level: level,
              }));
            }
          } catch {
            // fallback ke default
          }

          const response = await fetch('/api/sync/triage', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              triage_id: record.id,
              device_id: this.getDeviceId(),
              kader_id: this.getKaderId(),
              patient_hash: record.id, // Simplified
              patient_age: record.patientAge,
              patient_gender: record.patientGender,
              triage_level: record.triageLevel,
              conditions,
              triage_started_at: record.createdAt,
              triage_completed_at: record.createdAt,
              model_version: record.modelVersion,
              app_version: APP_VERSION,
            }),
          });

          if (response.ok || response.status === 409) {
            await markSynced(record.id);
            synced++;
          }
        } catch {
          // Network error — will retry later
        }
      }
      return synced;
    } catch {
      return 0;
    }
  }

  // ── Background Sync ──

  /**
   * Register for background sync via Service Worker.
   */
  async registerBackgroundSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register('sync-triage');
        console.log('[Sync] Background sync registered');
      } catch (error) {
        console.warn('[Sync] Background sync not supported:', error);
      }
    }
  }

  // ── Periodic Sync ──

  private startPeriodicSync(): void {
    if (this.syncIntervalId) return;
    this.syncIntervalId = setInterval(() => {
      if (this.connectionStatus === 'online') {
        this.syncNow();
      }
    }, SYNC_INTERVAL_MS);
    console.log(`[Sync] Periodic sync every ${SYNC_INTERVAL_MS / 1000}s`);
  }

  private stopPeriodicSync(): void {
    if (this.syncIntervalId) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }

  // ── Event Handlers ──

  private handleOnline = () => {
    this.connectionStatus = 'online';
    this.emit({
      type: 'connection-change',
      status: this.status,
      connectionStatus: 'online',
    });
    console.log('[Sync] Connection: online');
    // Try sync immediately when back online
    setTimeout(() => this.syncNow(), 1000);
  };

  private handleOffline = () => {
    this.connectionStatus = 'offline';
    this.emit({
      type: 'connection-change',
      status: this.status,
      connectionStatus: 'offline',
    });
    console.log('[Sync] Connection: offline');
  };

  private handleSWMessage = (event: MessageEvent) => {
    if (event.data?.type === 'sync-triage') {
      this.syncNow();
    }
  };

  // ── Status & Events ──

  private setStatus(status: SyncStatus): void {
    this.status = status;
  }

  getStatus(): SyncStatus {
    return this.status;
  }

  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  onEvent(fn: (event: SyncEvent) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private emit(event: SyncEvent): void {
    this.listeners.forEach((fn) => fn(event));
  }

  // ── Device & Kader IDs ──

  getDeviceId(): string {
    if (typeof window === 'undefined') return 'ssr';
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  }

  getKaderId(): string {
    if (typeof window === 'undefined') return 'ssr';
    return localStorage.getItem(KADER_ID_KEY) || 'unknown';
  }

  setKaderId(id: string): void {
    localStorage.setItem(KADER_ID_KEY, id);
  }

  // ── Yjs Debug Info ──

  getDebugInfo(): object {
    return {
      yjsDocSize: this.ydoc ? this.ydoc.store.clients.size : 0,
      triageCount: this.triageArray?.length ?? 0,
      status: this.status,
      connection: this.connectionStatus,
      persistenceSynced: this.ypersistence?.synced ?? false,
    };
  }

  // ── Cleanup ──

  /**
   * Destroy sync manager — cleanup all resources.
   */
  destroy(): void {
    this.isDestroyed = true;
    this.stopPeriodicSync();

    if (typeof window === 'undefined') return;

    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.removeEventListener('message', this.handleSWMessage);
    }

    this.ypersistence?.destroy();
    this.ydoc?.destroy();
    this.ydoc = null;
    this.triageArray = null;
    this.listeners = [];
    console.log('[Sync] Destroyed');
  }
}

// ── Singleton Export ──────────────────────────────────

export const syncManager = new SyncManager();
export default syncManager;
