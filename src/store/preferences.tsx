import { clear, createStore, del, get, set } from "idb-keyval";
import { WS_SERVER_URL } from "../config";

const customStore = createStore("outliner-preferences", "outliner-preferences");

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

const localPreferencesManager = {
  namespace: "rsoutliner:pref",

  buildKey(key: keyof StorageSchema) {
    return `${this.namespace}:${key}`;
  },

  async get<K extends keyof StorageSchema>(key: K): Promise<StorageSchema[K]> {
    const namespacedKey = this.buildKey(key);
    const value = await get(namespacedKey, customStore);

    if (value === undefined) return defaultValues[key];

    return value;
  },

  async set<K extends keyof StorageSchema>(key: K, value: StorageSchema[K]) {
    const namespacedKey = this.buildKey(key);
    await set(namespacedKey, value, customStore);
  },

  async setBatch(values: Partial<StorageSchema>) {
    const entries = Object.entries(values) as [keyof StorageSchema, StorageSchema[keyof StorageSchema]][];

    for (const [key, value] of entries) {
      await this.set(key, value);
    }
  },

  async remove<K extends keyof StorageSchema>(key: K) {
    const namespacedKey = this.buildKey(key);
    await del(namespacedKey, customStore);
  },

  async clear() {
    await clear(customStore);
  },

  async clearNamespace() {
    // idb-keyval doesn't expose keys() directly, so iterate through known keys
    const allKeys = Object.keys(defaultValues) as (keyof StorageSchema)[];

    for (const key of allKeys) {
      await this.remove(key);
    }
  },
};

export default localPreferencesManager;
