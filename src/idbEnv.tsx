import type { IDBPDatabase } from "idb";
import { openDB } from "idb";
import type { IDBLocalType, LocalConfigType, LocalIndexedDbDataType } from "./types";

let db: IDBPDatabase<LocalIndexedDbDataType> | null = null;

export async function getDB() {
  if (db) return db;

  db = await openDB<LocalIndexedDbDataType>("TreeRoLocalConfigIDB", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("localConfig")) {
        db.createObjectStore("localConfig"); // simple key/value store
      }
    },
  });

  return db;
}

export const IDBLocal: IDBLocalType = {
  db: db,
  async clearData() {
    if (db) {
      db.close();
      db = null;
    }
    await indexedDB.deleteDatabase("TreeRoLocalConfigIDB");
  },

  async getLocalConfig(): Promise<LocalConfigType | undefined> {
    const db = await getDB();
    // Use the key you want; assuming only one config stored under 'current'
    return db.get("localConfig", "current");
  },

  async setLocalConfig(localConfig: LocalConfigType) {
    const db = await getDB();
    // Store under a fixed key, e.g., 'current'
    await db.put("localConfig", localConfig, "current");
  },
};
