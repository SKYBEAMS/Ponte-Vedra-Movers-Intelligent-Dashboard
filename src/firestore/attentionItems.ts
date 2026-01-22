// src/firestore/attentionItems.ts
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase"; // adjust if your firebase export path differs

export type AttentionPriority = "CRITICAL" | "HEADS_UP";
export type AttentionStatus = "UNRESOLVED" | "RESOLVED" | "SNOOZED";
export type AttentionSource = "AUTO" | "MANUAL";
export type AttentionEntityType = "JOB" | "TRUCK" | "EMPLOYEE" | "SYSTEM";

export type AttentionItem = {
  id?: string;
  priority: AttentionPriority;
  status: AttentionStatus;
  source: AttentionSource;

  entityType?: AttentionEntityType;
  entityId?: string;

  title: string;
  message?: string;
  code?: string;

  createdBy?: string; // "system" or user/name later
  createdAt?: any;
  updatedAt?: any;
};

const colRef = collection(db, "attention_items");

export async function addAttentionItem(input: Omit<AttentionItem, "id" | "createdAt" | "updatedAt">) {
  return addDoc(colRef, {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function resolveAttentionItem(id: string) {
  const ref = doc(db, "attention_items", id);
  return updateDoc(ref, {
    status: "RESOLVED",
    updatedAt: serverTimestamp(),
  });
}

export function subscribeAttentionList(priority: AttentionPriority, cb: (items: AttentionItem[]) => void) {
  const q = query(
    colRef,
    where("priority", "==", priority),
    where("status", "==", "UNRESOLVED"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    const items: AttentionItem[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    cb(items);
  });
}

export function subscribeAttentionCounts(cb: (counts: { CRITICAL: number; HEADS_UP: number }) => void) {
  let critical = 0;
  let headsUp = 0;

  const qCritical = query(colRef, where("priority", "==", "CRITICAL"), where("status", "==", "UNRESOLVED"));
  const qHeadsUp = query(colRef, where("priority", "==", "HEADS_UP"), where("status", "==", "UNRESOLVED"));

  const unsub1 = onSnapshot(qCritical, (snap) => {
    critical = snap.size;
    cb({ CRITICAL: critical, HEADS_UP: headsUp });
  });

  const unsub2 = onSnapshot(qHeadsUp, (snap) => {
    headsUp = snap.size;
    cb({ CRITICAL: critical, HEADS_UP: headsUp });
  });

  return () => {
    unsub1();
    unsub2();
  };
}
