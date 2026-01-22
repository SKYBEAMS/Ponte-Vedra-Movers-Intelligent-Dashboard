// src/firestore/attentionItems.ts
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

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

  createdBy?: string;
  createdAt?: any;
  updatedAt?: any;
};

const colRef = collection(db, "attention_items");

export async function addAttentionItem(input: Omit<AttentionItem, "id" | "createdAt" | "updatedAt" | "status">) {
  const normalized = {
    ...input,
    priority: input.priority as AttentionPriority,
    status: "UNRESOLVED" as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(colRef, normalized);
  return {
    id: docRef.id,
    ...normalized,
  };
}

export async function resolveAttentionItem(id: string) {
  const ref = doc(db, "attention_items", id);
  return updateDoc(ref, {
    status: "RESOLVED",
    resolvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function snoozeAttentionItem(id: string, snoozeUntil: Date) {
  const ref = doc(db, "attention_items", id);
  return updateDoc(ref, {
    status: "SNOOZED",
    snoozedAt: serverTimestamp(),
    snoozeUntil,
    updatedAt: serverTimestamp(),
  });
}

export async function unsnoozeAttentionItem(id: string) {
  const ref = doc(db, "attention_items", id);
  return updateDoc(ref, {
    status: "UNRESOLVED",
    snoozeUntil: null,
    unsnoozedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function reopenAttentionItem(id: string) {
  const ref = doc(db, "attention_items", id);
  return updateDoc(ref, {
    status: "UNRESOLVED",
    reopenedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

function baseUnresolvedQuery(priority: AttentionPriority) {
  return query(
    colRef,
    where("priority", "==", priority),
    where("status", "==", "UNRESOLVED")
  );
}

export function subscribeAttentionList(priority: AttentionPriority, cb: (items: AttentionItem[]) => void) {
  const q = baseUnresolvedQuery(priority);
  return onSnapshot(q, (snap) => {
    const items: AttentionItem[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
    cb(items);
  });
}

export function subscribeAttentionListByStatus(
  priority: AttentionPriority,
  status: AttentionStatus,
  cb: (items: AttentionItem[]) => void,
  onError?: (err: Error) => void
) {
  const q = query(
    colRef,
    where("priority", "==", priority),
    where("status", "==", status)
  );

  return onSnapshot(
    q,
    (snap) => {
      const items: AttentionItem[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      cb(items);
    },
    (err) => {
      console.error("subscribeAttentionListByStatus error:", err);
      if (onError) onError(err);
    }
  );
}

export function subscribeAttentionCounts(
  cb: (counts: { CRITICAL: number; HEADS_UP: number }) => void,
  onError?: (err: Error) => void
) {
  let critical = 0;
  let headsUp = 0;

  const qCritical = baseUnresolvedQuery("CRITICAL");
  const qHeadsUp = baseUnresolvedQuery("HEADS_UP");

  const unsub1 = onSnapshot(
    qCritical,
    (snap) => {
      critical = snap.size;
      cb({ CRITICAL: critical, HEADS_UP: headsUp });
    },
    (err) => {
      console.error("subscribeAttentionCounts (CRITICAL) error:", err);
      if (onError) onError(err);
    }
  );

  const unsub2 = onSnapshot(
    qHeadsUp,
    (snap) => {
      headsUp = snap.size;
      cb({ CRITICAL: critical, HEADS_UP: headsUp });
    },
    (err) => {
      console.error("subscribeAttentionCounts (HEADS_UP) error:", err);
      if (onError) onError(err);
    }
  );

  return () => {
    unsub1();
    unsub2();
  };
}
