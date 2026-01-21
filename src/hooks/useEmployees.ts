import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import type { Employee } from "../types";

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "employees"), orderBy("rank", "desc"));

    const unsub = onSnapshot(
      q,
      (snap) => {
        const rows: Employee[] = snap.docs.map((d) => {
          const data = d.data() as any;

          return {
            id: d.id,
            name: data.name ?? "",
            initials: data.initials ?? "",
            phone: data.phone ?? "",
            rank: Number(data.rank ?? 0),
            hasLicense: Boolean(data.hasLicense ?? false),
            scheduledOff: Boolean(data.scheduledOff ?? false),
          };
        });

        setEmployees(rows);
        setLoading(false);
      },
      (e) => {
        setError(e.message);
        setLoading(false);
      }
    );

    return () => unsub();
  }, []);

  return { employees, loading, error };
}
