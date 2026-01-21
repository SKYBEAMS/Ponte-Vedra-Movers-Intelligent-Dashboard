import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import type { EmployeeNote } from "../types";

export async function addEmployeeNote(
  employeeId: string,
  note: {
    text: string;
    truckId?: string | null;
    createdBy?: string | null;
    tags?: string[];
    scheduleIntent?: boolean;
  }
) {
  console.log("addEmployeeNote -> employeeId:", employeeId, "note:", note);
  
  const ref = collection(db, "employees", employeeId, "notes");
  
  try {
    const docRef = await addDoc(ref, { ...note, createdAt: serverTimestamp() });
    console.log("addEmployeeNote -> wrote noteId:", docRef.id);
    return docRef.id;
  } catch (err) {
    console.error("addEmployeeNote -> FAILED:", err);
    throw err;
  }
}

export function listenEmployeeNotes(
  employeeId: string,
  cb: (notes: EmployeeNote[]) => void
) {
  const ref = collection(db, "employees", employeeId, "notes");
  const q = query(ref, orderBy("createdAt", "desc"), limit(20));

    return onSnapshot(
    q,
    (snap) => {
      const notes: EmployeeNote[] = snap.docs.map((d) => {
        const data: any = d.data();
        return {
          id: d.id,
          text: data.text ?? "",
          createdAt: data.createdAt ?? null,
          createdBy: data.createdBy ?? null,
          truckId: data.truckId ?? null,
          tags: data.tags ?? [],
          scheduleIntent: data.scheduleIntent ?? false,
        };
      });

      cb(notes);
    },
    (err) => {
      console.error("listenEmployeeNotes error:", err);
      cb([]); // keep UI alive even if rules/index fail
    }
  );
}