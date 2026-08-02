/**
 * Normalize Indonesian phone number to E.164 format (+628xx...)
 * Handles: 08xx, 628xx, +628xx, 08xx-xxx-xxx, etc.
 */
export function normalizePhone(input: string): string {
  // Hapus semua karakter non-digit kecuali +
  let digits = input.replace(/[^\d+]/g, '');

  // Handle 08xx prefix → +628xx
  if (digits.startsWith('0')) {
    digits = '+62' + digits.slice(1);
  }
  // Handle 628xx prefix → +628xx
  else if (digits.startsWith('62')) {
    digits = '+' + digits;
  }
  // Handle +628xx (already correct)
  // Handle bare numbers without prefix — treat as local

  return digits;
}

/**
 * Format phone number for display: 08xx-xxxx-xxxx
 */
export function formatPhone(input: string): string {
  const normalized = normalizePhone(input);
  // +6281234567890 → 0812-3456-7890
  const local = normalized.startsWith('+62') ? '0' + normalized.slice(3) : normalized;
  if (local.length === 11) {
    return `${local.slice(0, 4)}-${local.slice(4, 8)}-${local.slice(8)}`;
  }
  if (local.length === 12) {
    return `${local.slice(0, 5)}-${local.slice(5, 9)}-${local.slice(9)}`;
  }
  if (local.length === 13) {
    return `${local.slice(0, 5)}-${local.slice(5, 9)}-${local.slice(9)}`;
  }
  return local;
}
