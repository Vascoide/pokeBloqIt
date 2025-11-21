import { openDB } from "idb";

const DB_NAME = "pokebloqit-db";
const DB_VER = 1;
const POKE_STORE = "dex";
const CACHE_STORE = "api-cache";

export async function getDB() {
  return openDB(DB_NAME, DB_VER, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(POKE_STORE)) {
        const os = db.createObjectStore(POKE_STORE, { keyPath: "name" });
        os.createIndex("caughtAt", "caughtAt");
      }
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        db.createObjectStore(CACHE_STORE, { keyPath: "key" });
      }
    },
  });
}

export { POKE_STORE, CACHE_STORE };
