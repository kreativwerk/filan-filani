/** IBAN-Prüfung nach ISO 13616 (Mod-97), inkl. Normalisierung. */

export function normalizeIban(input: string): string {
  return input.replace(/[\s-]/g, "").toUpperCase();
}

/** Formatiert für die Anzeige in Vierergruppen: XK05 1212 0123 4567 8906 */
export function formatIban(iban: string): string {
  return normalizeIban(iban).replace(/(.{4})/g, "$1 ").trim();
}

export function isValidIban(input: string): boolean {
  const iban = normalizeIban(input);
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/.test(iban)) return false;

  // Die ersten vier Zeichen ans Ende, Buchstaben → Zahlen (A=10 … Z=35)
  const rearranged = iban.slice(4) + iban.slice(0, 4);
  const digits = rearranged.replace(/[A-Z]/g, (c) =>
    String(c.charCodeAt(0) - 55),
  );

  // Mod 97 stückweise, damit keine Zahl zu groß wird
  let remainder = 0;
  for (const d of digits) {
    remainder = (remainder * 10 + Number(d)) % 97;
  }
  return remainder === 1;
}
