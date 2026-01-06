// ✅ src/utils/employeewarnings.ts
import type { Employee, WarningLevel } from "../types";

export function evaluateEmployeeWarnings(
  employee: Employee,
  ctx?: { isAssigned?: boolean }
): { warningLevel: WarningLevel; warningNote?: string } {
  const isAssigned = !!ctx?.isAssigned;

  // 🔴 HARD
  if (isAssigned && employee.scheduledOff) {
    return { warningLevel: "hard", warningNote: "Scheduled off but assigned" };
  }

  const checkInStatus = (employee as any)?.checkInStatus;
  if (isAssigned && checkInStatus === "notReplied") {
    return { warningLevel: "hard", warningNote: "No check-in response (30m)" };
  }

  // 🟡 (No employee-level hard warning for missing phone — per your rule)
  // We show phone capability as an icon, and truck-level warning covers “no phone for check-ins”.

  return { warningLevel: "none" };
}
