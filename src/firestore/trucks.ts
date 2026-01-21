import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { Truck } from "../types";

export async function updateTruck(truckId: string, patch: Partial<Truck>) {
  await updateDoc(doc(db, "trucks", truckId), patch);
}
