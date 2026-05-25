import { Preferences } from "@capacitor/preferences";
import { WS_SERVER_URL } from "../../config";

type StorageSchema = {
  roomToken: string;
  isAuthorized: boolean;
  rootBlockId: string;
  isWebSocketServerOn: boolean;
  webSocketServerUrl: string;
  theme: "system" | "light" | "dark";
};

const defaultValues: StorageSchema = {
  roomToken: "",
  isAuthorized: false,
  rootBlockId: "",
  isWebSocketServerOn: true,
  webSocketServerUrl: WS_SERVER_URL,
  theme: "system",
};

const localPreferencesManager = {
  namespace: "treero:pref",

  buildKey(key: keyof StorageSchema) {
    return `${this.namespace}:${key}`;
  },

  async get<K extends keyof StorageSchema>(key: K): Promise<StorageSchema[K]> {
    const namespacedKey = this.buildKey(key);
    const { value } = await Preferences.get({ key: namespacedKey });

    if (value === null) return defaultValues[key];

    return JSON.parse(value).v;
  },

  async set<K extends keyof StorageSchema>(key: K, value: StorageSchema[K]) {
    const namespacedKey = this.buildKey(key);
    await Preferences.set({
      key: namespacedKey,
      value: JSON.stringify({ v: value }),
    });
  },

  async setBatch(values: Partial<StorageSchema>) {
    const entries = Object.entries(values) as [keyof StorageSchema, StorageSchema[keyof StorageSchema]][];

    for (const [key, value] of entries) {
      await this.set(key, value);
    }
  },

  async remove<K extends keyof StorageSchema>(key: K) {
    const namespacedKey = this.buildKey(key);
    await Preferences.remove({ key: namespacedKey });
  },

  async clear() {
    await Preferences.clear();
  },

  async clearNamespace() {
    const { keys } = await Preferences.keys();
    const prefix = this.namespace + ":";

    for (const key of keys) {
      if (key.startsWith(prefix)) {
        await Preferences.remove({ key });
      }
    }
  },
};
export default localPreferencesManager;
