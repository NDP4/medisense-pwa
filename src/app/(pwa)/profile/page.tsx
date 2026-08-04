'use client';

import { useState, useCallback, useEffect } from 'react';
import { User, Shield, Info, ChevronRight, ChevronDown, Download, Trash2, Eye, Database, AlertTriangle, LogOut, Lock, Phone, Building, BadgeCheck, FileText, Server, Activity, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTriageStore } from '@/store/triage-store';
import { useAuthStore } from '@/store/auth-store';
import { clearAllData } from '@/lib/db';
import Modal from '@/components/ui/modal';
import { useT, useLanguageStore } from '@/lib/i18n/use-t';
import { FlagID, FlagGB } from '@/components/ui/flags';

// Update saat rilis baru — lihat package.json "version"
const APP_VERSION = 'v0.2.0';

/* ── Profile Page ─────────────────────────────────────── */
/* DESIGN.md §7.1 — Profil dengan hak subjek data UU PDP    */

type SectionId = 'data-pengguna' | 'privasi' | 'tentang' | null;

function translateRole(t: (key: string, vars?: Record<string, string | number>) => string, role: string): string {
  switch (role) {
    case 'kader': return t('auth.roleKader');
    case 'bidan': return t('auth.roleBidan');
    case 'puskesmas': return t('auth.rolePuskesmas');
    default: return role.replace('_', ' ');
  }
}

export default function ProfilePage() {
  const { t, lang } = useT();
  const setLang = useLanguageStore((s) => s.setLang);
  const router = useRouter();
  const { history, clearHistory } = useTriageStore();
  const { user, isLoggedIn, logout } = useAuthStore();
  const [exportStatus, setExportStatus] = useState<'idle' | 'exported' | 'error'>('idle');
  const [deleteStatus, setDeleteStatus] = useState<'idle' | 'deleting' | 'done'>('idle');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [expandedSection, setExpandedSection] = useState<SectionId>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Tampilkan modal login jika belum login
  useEffect(() => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
    }
  }, [isLoggedIn]);

  // ── Toggle expandable sections ──

  const toggleSection = (section: SectionId) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  };

  // ── Export ──

  const handleExport = useCallback(() => {
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        appVersion: APP_VERSION,
        totalRecords: history.length,
        records: history,
      };
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `medisense-data-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportStatus('exported');
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch {
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 3000);
    }
  }, [history]);

  // ── Delete all data ──

  const handleDeleteAll = useCallback(async () => {
    setDeleteStatus('deleting');
    try {
      await clearAllData();
      clearHistory();
      setDeleteStatus('done');
      setTimeout(() => {
        setShowDeleteModal(false);
        setDeleteStatus('idle');
      }, 1500);
    } catch {
      setDeleteStatus('idle');
    }
  }, [clearHistory]);

  // ── Logout ──

  const handleLogout = useCallback(() => {
    logout();
    setShowLogoutModal(false);
    window.location.href = '/login';
  }, [logout]);

  // ── Info panels ──

  const sectionContent: Record<string, { icon: typeof User; label: string; content: React.ReactNode }> = {
    'data-pengguna': {
      icon: User,
      label: t('profile.userPanel'),
      content: isLoggedIn && user ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs text-text-secondary">{t('profile.fullName')}</p>
              <p className="text-sm font-medium text-text-primary">{user.fullName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <BadgeCheck className="w-4 h-4 text-blue-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs text-text-secondary">{t('profile.role')}</p>
              <p className="text-sm font-medium text-text-primary">{translateRole(t, user.role)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4 text-green-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs text-text-secondary">{t('profile.phone')}</p>
              <p className="text-sm font-medium text-text-primary">{user.phone || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
              <Building className="w-4 h-4 text-purple-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs text-text-secondary">{t('profile.puskesmas')}</p>
              <p className="text-sm font-medium text-text-primary">{user.puskesmasName || user.puskesmasId || '-'}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <Lock className="w-4 h-4" strokeWidth={1.5} />
          <span>{t('profile.loginToSee')}</span>
        </div>
      ),
    },
    'privasi': {
      icon: Shield,
      label: t('profile.privacyPanel'),
      content: (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-4 h-4 text-green-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{t('profile.encTitle')}</p>
              <p className="text-xs text-text-secondary leading-relaxed">
                {t('profile.encBody')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
              <Eye className="w-4 h-4 text-blue-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{t('profile.privTitle')}</p>
              <p className="text-xs text-text-secondary leading-relaxed">
                {t('profile.privBody')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
              <FileText className="w-4 h-4 text-amber-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{t('profile.pdpaTitle')}</p>
              <p className="text-xs text-text-secondary leading-relaxed">
                {t('profile.pdpaBody')}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    'tentang': {
      icon: Info,
      label: t('profile.aboutPanel'),
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs text-text-secondary">{t('profile.app')}</p>
              <p className="text-sm font-medium text-text-primary">MediSense AI v0.2.0</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <Server className="w-4 h-4 text-blue-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs text-text-secondary">{t('profile.modelAi')}</p>
              <p className="text-sm font-medium text-text-primary">MediSense Triage v1.0 (Demo)</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
              <Database className="w-4 h-4 text-green-600" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs text-text-secondary">{t('profile.sessions')}</p>
              <p className="text-sm font-medium text-text-primary">{t('profile.sessionsValue', { n: history.length })}</p>
            </div>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed pt-2 border-t border-border">
            {t('profile.aboutBody')}
          </p>
        </div>
      ),
    },
  };

  return (
    <div className="px-4 pt-6 pb-8">
      <h1 className="text-xl font-bold text-text-primary mb-6">{t('profile.title')}</h1>

      {/* User card */}
      <div className="bg-surface rounded-xl p-6 border border-border mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-lg font-semibold text-text-primary">
              {isLoggedIn && user ? user.fullName : t('profile.offlineUser')}
            </p>
            <p className="text-sm text-text-secondary">
              {isLoggedIn && user ? translateRole(t, user.role) : t('profile.notLoggedIn')}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">
              {t('profile.triageDone', { n: history.length })}
            </p>
          </div>
        </div>
      </div>

      {/* ── Expandable Info Sections ── */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden mb-6">
        {(Object.entries(sectionContent) as [SectionId, typeof sectionContent[string]][]).map(([id, sec]) => {
          const isOpen = expandedSection === id;
          const Icon = sec.icon;
          return (
            <div key={id} className="border-b border-border last:border-b-0">
              <button
                onClick={() => toggleSection(id)}
                className="w-full flex items-center gap-4 p-4 hover:bg-muted transition-colors text-left"
                aria-expanded={isOpen}
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{sec.label}</p>
                  <p className="text-xs text-text-secondary truncate">
                    {isOpen ? t('profile.close') : t('profile.tapForDetails')}
                  </p>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-5 h-5 text-text-secondary" strokeWidth={1.5} />
                ) : (
                  <ChevronRight className="w-5 h-5 text-text-secondary" strokeWidth={1.5} />
                )}
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div className="px-4 pb-4 pt-0 border-t border-border">
                  <div className="pt-4">
                    {sec.content}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Language / Bahasa ── */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden mb-6">
        <div className="flex items-center gap-4 p-4">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary">{t('profile.languageTitle')}</p>
            <p className="text-xs text-text-secondary">{t('profile.languageSub')}</p>
          </div>
        </div>
        {/* Segmented control ID / EN */}
        <div className="px-4 pb-4">
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1" role="tablist" aria-label={t('profile.languageTitle')}>
            <button
              type="button"
              role="tab"
              aria-selected={lang === 'id'}
              onClick={() => setLang('id')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
                lang === 'id' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <FlagID className="w-4 h-4" />
              {t('profile.languageId')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={lang === 'en'}
              onClick={() => setLang('en')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold rounded-lg transition-all ${
                lang === 'en' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <FlagGB className="w-4 h-4" />
              {t('profile.languageEn')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Logout ── */}
      {isLoggedIn && (
        <div className="bg-surface rounded-xl border border-border overflow-hidden mb-6">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-4 p-4 hover:bg-muted transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <LogOut className="w-5 h-5 text-red-600" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-600">{t('profile.logout')}</p>
              <p className="text-xs text-text-secondary">{t('profile.logoutSub')}</p>
            </div>
          </button>
        </div>
      )}

      {/* ── Data Saya (Hak Subjek Data) ── */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" strokeWidth={1.5} />
            <h2 className="text-base font-semibold text-text-primary">{t('profile.myData')}</h2>
          </div>
          <p className="text-xs text-text-secondary mt-0.5">
            {t('profile.myDataSub')}
          </p>
        </div>

        {/* Lihat Riwayat */}
        <div className="flex items-center gap-4 p-4 border-b border-border">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Eye className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary">{t('profile.savedHistory')}</p>
            <p className="text-xs text-text-secondary">
              {t('profile.savedHistorySub', { n: history.length })}
            </p>
          </div>
        </div>

        {/* Ekspor Data */}
        <button
          onClick={handleExport}
          className="w-full flex items-center gap-4 p-4 hover:bg-muted transition-colors border-b border-border text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
            <Download className="w-5 h-5 text-green-600" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary">{t('profile.exportData')}</p>
            <p className="text-xs text-text-secondary">
              {exportStatus === 'idle' && t('profile.exportSubIdle')}
              {exportStatus === 'exported' && t('profile.exportSubDone')}
              {exportStatus === 'error' && t('profile.exportSubError')}
            </p>
          </div>
        </button>

        {/* Hapus Semua Data */}
        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full flex items-center gap-4 p-4 hover:bg-muted transition-colors text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" strokeWidth={1.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-red-600">{t('profile.deleteAll')}</p>
            <p className="text-xs text-text-secondary">{t('profile.deleteAllSub')}</p>
          </div>
        </button>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 rounded-xl bg-kuning-bg border border-kuning/20">
        <p className="text-xs text-kuning/80 leading-relaxed">
          {t('profile.disclaimer')}
        </p>
      </div>

      {/* ── Modals ── */}

      {/* Login Prompt Modal */}
      <Modal
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        title={t('profile.loginPromptTitle')}
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-primary" strokeWidth={1.5} />
        </div>
        <h2 id="modal-login-akses-profil-title" className="text-lg font-bold text-text-primary mb-2">
          {t('profile.loginPromptTitle')}
        </h2>
        <p className="text-sm text-text-secondary mb-6 leading-relaxed">
          {t('profile.loginPromptBody')}
        </p>
        <button
          onClick={() => router.push('/login')}
          className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors mb-3"
        >
          {t('profile.loginBtn')}
        </button>
        <button
          type="button"
          onClick={() => setShowLoginPrompt(false)}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          {t('profile.later')}
        </button>
      </Modal>

      {/* Hapus Semua Data — Modal Konfirmasi */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t('profile.deleteModalTitle')}
        destructive
        requireExplicitClose
      >
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <Trash2 className="w-8 h-8 text-red-600" strokeWidth={1.5} />
        </div>
        <h2 id="modal-hapus-data-title" className="text-lg font-bold text-text-primary mb-2">
          {t('profile.deleteModalTitle')}
        </h2>
        <p className="text-sm text-text-secondary mb-6 leading-relaxed">
          {deleteStatus === 'deleting'
            ? t('profile.deleteBodyDeleting')
            : deleteStatus === 'done'
            ? t('profile.deleteBodyDone')
            : t('profile.deleteBodyConfirm')}
        </p>

        {deleteStatus === 'idle' && (
          <div className="w-full space-y-3">
            <button
              type="button"
              onClick={handleDeleteAll}
              className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
            >
              {t('profile.yesDeleteAll')}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              {t('profile.cancel')}
            </button>
          </div>
        )}
      </Modal>

      {/* Logout — Modal Konfirmasi */}
      <Modal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title={t('profile.logoutModalTitle')}
        destructive
        requireExplicitClose
      >
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <LogOut className="w-8 h-8 text-red-600" strokeWidth={1.5} />
        </div>
        <h2 id="modal-keluar-akun-title" className="text-lg font-bold text-text-primary mb-2">
          {t('profile.logoutModalTitle')}
        </h2>
        <p className="text-sm text-text-secondary mb-6 leading-relaxed">
          {t('profile.logoutModalBody')}
        </p>
        <div className="w-full space-y-3">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
          >
            {t('profile.yesLogout')}
          </button>
          <button
            type="button"
            onClick={() => setShowLogoutModal(false)}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            {t('profile.cancel')}
          </button>
        </div>
      </Modal>
    </div>
  );
}
