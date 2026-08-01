import { clear, createStore, del, get, set, setMany } from "idb-keyval";
import { WS_SERVER_URL } from "../config";

const customStore = createStore("rs-outliner-preferences", "rs-outliner-preferences");

type StorageSchema = {
  roomToken: string;
  isAuthorized: boolean;
  rootBlockId: string;
  isWebSocketServerOn: boolean;
  webSocketServerUrl: string;
  theme: "system" | "light" | "dark";
  lockScreenPin: string;
  autoLockTimeout: number;
};

const defaultValues: StorageSchema = {
  roomToken: "",
  isAuthorized: false,
  rootBlockId: "",
  isWebSocketServerOn: true,
  webSocketServerUrl: WS_SERVER_URL,
  theme: "system",
  lockScreenPin: "",
  autoLockTimeout: -1,
};

const localPref = {
  async get<K extends keyof StorageSchema>(key: K): Promise<StorageSchema[K]> {
    const value = await get(key, customStore);

    if (value === undefined) return defaultValues[key];

    return value;
  },

  async set<K extends keyof StorageSchema>(key: K, value: StorageSchema[K]) {
    await set(key, value, customStore);
  },

  async setMany(keyVal: Partial<StorageSchema>) {
    const entries = Object.entries(keyVal) as [string, any][];
    await setMany(entries, customStore);
  },

  async remove<K extends keyof StorageSchema>(key: K) {
    await del(key, customStore);
  },

  async clear() {
    await clear(customStore);
  },
};

export default localPref;
