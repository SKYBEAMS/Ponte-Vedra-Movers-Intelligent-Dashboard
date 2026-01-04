// src/utils/address.ts

export function shortAddress(full?: string): string {
  const s = (full ?? "").trim();
  if (!s) return "—";

  const parts = s.split(",").map(p => p.trim()).filter(Boolean);

  // Common US formats:
  // "123 Main St, Jacksonville, FL 32256"
  // parts = ["123 Main St", "Jacksonville", "FL 32256"]
  if (parts.length >= 3) {
    const city = parts[1];
    const st = parts[2].split(" ")[0]; // "FL"
    return `${city}, ${st}`.trim();
  }

  // "Jacksonville, FL"
  if (parts.length === 2) {
    const city = parts[0];
    const st = parts[1].split(" ")[0];
    return `${city}, ${st}`.trim();
  }

  // No commas (like "Jax Beach" or "PV") → keep it short
  return s.length > 22 ? s.slice(0, 22).trimEnd() + "…" : s;
}

export function fromToDisplay(pickup?: string, dropoff?: string): string {
  return `${shortAddress(pickup)} → ${shortAddress(dropoff)}`;
}
