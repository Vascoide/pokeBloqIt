import { openDB, type IDBPDatabase } from "idb";
import { PokeBloqitDB } from "./schema";

export const DB_NAME = "pokebloqit-db";
export const DB_VER = 3;

export const POKE_STORE = "dex" as const;
export const OFFLINE_STORE = "offline-actions" as const;
export const POKE_DATA_STORE = "pokemon-data" as const;

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
        }

        if (oldVersion < 2) {
          db.createObjectStore(OFFLINE_STORE, {
            keyPath: "id",
            autoIncrement: true,
          });
        }

        if (oldVersion < 3) {
          db.createObjectStore(POKE_DATA_STORE, {
            keyPath: "id",
          });
        }
      },
    });
  }

  return dbPromise;
}
