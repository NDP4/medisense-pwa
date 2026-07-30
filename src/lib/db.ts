import Dexie, { type Table } from 'dexie';
import { encryptData, decryptData } from './crypto';

export interface TriageRecord {
  id: string;
  patientNameEncrypted: string;
  patientAge: number;
  patientGender: number;
  triageLevel: 'hijau' | 'kuning' | 'merah';
  conditions: string;
  confidence: number;
  voiceTextEncrypted?: string;
  modelVersion: string;
  createdAt: string;
  synced: number;
}

export interface PatientRecord {
  id: string;
  nameEncrypted: string;
  age: number;
  gender: number;
  relationship: string;
  createdAt: string;
}

class MediSenseDB extends Dexie {
  triageSessions!: Table<TriageRecord, string>;
  patients!: Table<PatientRecord, string>;

  constructor() {
    super('MediSenseDB');
    this.version(1).stores({
      triageSessions: 'id, createdAt, triageLevel, synced',
      patients: 'id, relationship',
    });
  }
}

const db = new MediSenseDB();

export async function saveTriageSession(session: {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: number;
  triageLevel: 'hijau' | 'kuning' | 'merah';
  conditions: string;
  confidence: number;
  voiceText?: string;
  modelVersion: string;
  createdAt: string;
}) {
  const encryptedName = await encryptData(session.patientName);
  const encryptedVoice = session.voiceText
    ? await encryptData(session.voiceText)
    : undefined;

  await db.triageSessions.put({
    id: session.id,
    patientNameEncrypted: encryptedName,
    patientAge: session.patientAge,
    patientGender: session.patientGender,
    triageLevel: session.triageLevel,
    conditions: session.conditions,
    confidence: session.confidence,
    voiceTextEncrypted: encryptedVoice,
    modelVersion: session.modelVersion,
    createdAt: session.createdAt,
    synced: 0,
  });
}

export async function getDecryptedHistory(): Promise<Array<{
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: number;
  triageLevel: string;
  conditions: string;
  confidence: number;
  voiceText?: string;
  createdAt: string;
}>> {
  const records = await db.triageSessions
    .orderBy('createdAt')
    .reverse()
    .toArray();

  const decrypted = await Promise.all(
    records.map(async (r) => ({
      id: r.id,
      patientName: await decryptData(r.patientNameEncrypted),
      patientAge: r.patientAge,
      patientGender: r.patientGender,
      triageLevel: r.triageLevel,
      conditions: r.conditions,
      confidence: r.confidence,
      voiceText: r.voiceTextEncrypted
        ? await decryptData(r.voiceTextEncrypted)
        : undefined,
      createdAt: r.createdAt,
    }))
  );
  return decrypted;
}

export async function savePatient(patient: {
  id: string;
  name: string;
  age: number;
  gender: number;
  relationship: string;
}) {
  const encryptedName = await encryptData(patient.name);
  await db.patients.put({
    id: patient.id,
    nameEncrypted: encryptedName,
    age: patient.age,
    gender: patient.gender,
    relationship: patient.relationship,
    createdAt: new Date().toISOString(),
  });
}

export async function getDecryptedPatients(): Promise<Array<{
  id: string;
  name: string;
  age: number;
  gender: number;
  relationship: string;
}>> {
  const records = await db.patients.toArray();
  return Promise.all(
    records.map(async (r) => ({
      id: r.id,
      name: await decryptData(r.nameEncrypted),
      age: r.age,
      gender: r.gender,
      relationship: r.relationship,
    }))
  );
}

export async function clearAllData(): Promise<void> {
  await db.triageSessions.clear();
  await db.patients.clear();
}

export async function markSynced(id: string): Promise<void> {
  await db.triageSessions.update(id, { synced: 1 });
}

export async function getUnsyncedRecords(): Promise<TriageRecord[]> {
  return db.triageSessions.where('synced').equals(0).toArray();
}

export default db;
