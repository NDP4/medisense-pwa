'use client';

import { useCallback } from 'react';
import { translations, type Language } from './translations';
import { useLanguageStore } from './language-store';

/* ── Translation Hook + Helpers ────────────────────────── */
/* t(key) dengan fallback: lang → id → key string itu sendiri */
/* Placeholder: t('key', { n: 5 }) → pola {n} diganti        */

export { useLanguageStore };

export function useT() {
  const lang = useLanguageStore((s) => s.lang);
  const t = useCallback((key: string, vars?: Record<string, string | number>) => {
    const [ns, ...rest] = key.split('.');
    const k = rest.join('.');
    const dict = translations[lang] ?? translations.id;
    let val = dict[ns]?.[k] ?? translations.id[ns]?.[k] ?? key;
    if (vars) for (const [vk, vv] of Object.entries(vars)) val = val.replaceAll(`{${vk}}`, String(vv));
    return val;
  }, [lang]);
  return { t, lang };
}

/** Locale string untuk format tanggal (id-ID / en-US) */
export function localeOf(lang: Language): string {
  return lang === 'en' ? 'en-US' : 'id-ID';
}

/** Format tanggal dengan locale sesuai bahasa aktif */
export function formatDate(
  lang: Language,
  date: Date | string | number,
  opts?: Intl.DateTimeFormatOptions
): string {
  const d = new Date(date);
  return d.toLocaleDateString(localeOf(lang), opts);
}

/** Key rekomendasi per string Indonesia yang disimpan di store/history */
const RECOMMENDATION_KEYS: Record<string, string> = {
  'Istirahat yang cukup dan perbanyak minum air putih': 'rec.restHydrate',
  'Pantau gejala dalam 24 jam ke depan': 'rec.monitor24h',
  'Jika memburuk, segera ke Puskesmas terdekat': 'rec.worsenGoPuskesmas',
  'Rujuk ke Puskesmas dalam waktu 24 jam': 'rec.refer24h',
  'Pantau napas anak — jika sesak memburuk, segera ke IGD': 'rec.monitorChildBreathing',
  'Waspada tanda bahaya: demam tinggi tidak turun, napas cepat, tubuh lemas': 'rec.sepsisDanger',
  'Jangan berikan obat tanpa resep dokter': 'rec.noOTC',
  'Bawa hasil triase ini saat ke Puskesmas': 'rec.bringResult',
  'SEGERA hubungi 119 atau layanan darurat terdekat!': 'rec.call119',
  'Tanda bahaya sepsis: demam tinggi, napas cepat, kebingungan': 'rec.sepsisSigns',
  'Tanda bahaya pneumonia balita: tarikan dinding dada, napas cepat': 'rec.pneumoniaSigns',
  'Jangan menunggu — setiap menit sangat berharga': 'rec.dontWait',
  'Bawa pasien ke fasilitas kesehatan terdekat sambil menunggu ambulans': 'rec.whileWaiting',
};

/** Terjemahkan daftar rekomendasi (string snapshot Indonesia → t(key)) */
export function translateRecommendations(
  t: (key: string, vars?: Record<string, string | number>) => string,
  recommendations: string[]
): string[] {
  return recommendations.map((rec) => {
    const key = RECOMMENDATION_KEYS[rec];
    return key ? t(key) : rec;
  });
}

/** Pesan error user-facing dari sumber internal (voice.ts dll) → terjemahan */
const ERROR_MESSAGE_KEYS: Record<string, string> = {
  'Web Speech API tidak didukung browser ini': 'voice.errWebSpeechUnsupported',
  'Izin mikrofon diperlukan. Izinkan akses mikrofon di pengaturan browser.': 'voice.errMicPermission',
  'Mode offline: unduh model suara terlebih dahulu': 'voice.errOfflineModel',
  'Gagal mengunduh model suara. Coba lagi nanti.': 'voice.errDownloadModel',
  'Gagal mengunduh model suara.': 'voice.errDownloadModelShort',
  'Masukkan nomor telepon': 'auth.errPhoneReq',
  'Masukkan password': 'auth.errPassReq',
  'Login gagal. Periksa nomor telepon dan password.': 'auth.errLoginFailed',
  'Tidak dapat terhubung ke server. Periksa koneksi internet.': 'auth.errNetwork',
  'Nama lengkap minimal 3 karakter': 'auth.errName',
  'Nomor telepon tidak valid': 'auth.errPhone',
  'Pilih puskesmas tempat Anda bertugas': 'auth.errPuskesmas',
  'Password minimal 8 karakter': 'auth.errPass',
  'Password dan konfirmasi password tidak sama': 'auth.errPassMismatch',
  'Registrasi gagal. Coba lagi.': 'auth.errReg',
  'Gagal sinkronisasi': 'triage.syncFailed',
};

export function translateErrorMessage(
  t: (key: string, vars?: Record<string, string | number>) => string,
  msg: string
): string {
  const key = ERROR_MESSAGE_KEYS[msg];
  return key ? t(key) : msg;
}

/** Nama kondisi medis dari kode API (sepsis, pneumonia_balita, tidak_ada) */
export function translateCondition(
  t: (key: string, vars?: Record<string, string | number>) => string,
  code: string
): string {
  return t(`conditions.${code}`);
}

/** Label level triase (AMAN/WASPADA/DARURAT vs SAFE/CAUTION/EMERGENCY) */
export function translateLevel(
  t: (key: string, vars?: Record<string, string | number>) => string,
  level: string
): string {
  switch (level) {
    case 'hijau': return t('result.levelHijau');
    case 'kuning': return t('result.levelKuning');
    case 'merah': return t('result.levelMerah');
    default: return level;
  }
}

/** Hubungan pasien (string snapshot Indonesia di store → terjemahan) */
const RELATION_KEYS: Record<string, string> = {
  'Diri Sendiri': 'relations.self',
  'Anak': 'relations.child',
  'Ibu': 'relations.mother',
  'Ayah': 'relations.father',
  'Kakek': 'relations.grandfather',
  'Nenek': 'relations.grandmother',
  'Lainnya': 'relations.other',
};

export function translateRelation(
  t: (key: string, vars?: Record<string, string | number>) => string,
  relation: string
): string {
  const key = RELATION_KEYS[relation];
  return key ? t(key) : relation;
}
