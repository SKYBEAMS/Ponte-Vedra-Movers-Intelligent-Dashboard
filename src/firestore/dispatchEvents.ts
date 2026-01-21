import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export async function addDispatchEvent(event: {
  type: "EMPLOYEE_NOTE_ADDED";
  employeeId: string;
  employeeName?: string | null;
  truckId?: string | null;
  noteId: string;
  text: string;
  status?: "NEW" | "PROCESSED" | "ERROR";
}) {
  const ref = collection(db, "dispatch_events");
  await addDoc(ref, {
    ...event,
    status: event.status ?? "NEW",
    createdAt: serverTimestamp(),
  });
}

