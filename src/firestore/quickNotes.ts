import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export async function addQuickNote(text: string) {
  const clean = text.trim();
  if (!clean) return;

  await addDoc(collection(db, "ops_quick_notes"), {
    text: clean,
    createdAt: serverTimestamp(),
    source: "quick_notes",
    status: "UNRESOLVED",
  });
}
