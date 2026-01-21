import type { Employee } from "../types";

console.log("USING NEW pickLeadAndContact ✅");

export function pickLeadAndContact(crew: Employee[]): {
  lead: Employee | null;
  contact: Employee | null;
} {
  // Only employees with a phone can be lead or contact
  const withPhone = crew
    .filter((e) => (e.phone ?? "").trim().length > 0)
    .sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0));

  const lead = withPhone.length > 0 ? withPhone[0] : null;
  const contact = withPhone.length > 1 ? withPhone[1] : lead; // if only one, contact = lead

  return { lead, contact };
}
