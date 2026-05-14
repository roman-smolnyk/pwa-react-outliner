import { Preferences } from "@capacitor/preferences";
import { WS_SERVER_URL } from "../../config";

export interface LocalPreferences {
  roomToken: string;
  isAuthorized: boolean;
  rootBlockId: string;
  webSocketServerUrl: string;
}

export interface LocalPreferencesManager {
  key: "LocalPreferences";
  get(): Promise<LocalPreferences>;
  set(localPref: Partial<LocalPreferences>): Promise<void>;
  clear: () => Promise<void>;
}

const localPreferencesManager: LocalPreferencesManager = {
  key: "LocalPreferences",

  async get() {
    const defaultPrefs: LocalPreferences = {
      roomToken: "",
      isAuthorized: false,
      rootBlockId: "",
      webSocketServerUrl: WS_SERVER_URL,
    };

    const { value } = await Preferences.get({ key: this.key });

    try {
      return value ? JSON.parse(value) : defaultPrefs;
    } catch {
      return defaultPrefs;
    }
  },

  async set(localPref) {
    const currentPrefs = await this.get();

    const updatedPrefs = {
      ...currentPrefs,
      ...localPref,
    };

    console.debug("Preferences.set", updatedPrefs);
    await Preferences.set({
      key: this.key,
      value: JSON.stringify(updatedPrefs),
    });
  },

  async clear() {
    await Preferences.clear();
  },
};

export default localPreferencesManager;
