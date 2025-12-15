import { getDB, OFFLINE_STORE } from "./idb";
import { OfflineAction } from "../types/offline";

export async function queueOfflineAction(action: OfflineAction) {
  const db = await getDB();
  await db.add(OFFLINE_STORE, action);
}

export async function getOfflineActions(): Promise<OfflineAction[]> {
  const db = await getDB();
  return db.getAll(OFFLINE_STORE);
}

export async function clearOfflineActions() {
  const db = await getDB();
  await db.clear(OFFLINE_STORE);
}
