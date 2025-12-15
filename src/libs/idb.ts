import { openDB, type IDBPDatabase } from "idb";
import { PokeBloqitDB } from "../db/schema";

export const DB_NAME = "pokebloqit-db";
export const DB_VER = 2;

export const POKE_STORE = "dex" as const;
export const CACHE_STORE = "api-cache" as const;
export const OFFLINE_STORE = "offline-actions" as const;

let dbPromise: Promise<IDBPDatabase<PokeBloqitDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<PokeBloqitDB>(DB_NAME, DB_VER, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const dex = db.createObjectStore(POKE_STORE, {
            keyPath: "name",
          });

          dex.createIndex("caughtAt", "caughtAt");

          db.createObjectStore(CACHE_STORE, {
            keyPath: "key",
          });
        }

        if (oldVersion < 2) {
          db.createObjectStore(OFFLINE_STORE, {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      },
    });
  }

  return dbPromise;
}
