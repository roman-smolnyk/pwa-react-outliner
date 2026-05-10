import { Preferences } from "@capacitor/preferences";

export interface LocalPreferences {
  roomToken: string;
  authorized: boolean;
  rootBlockId: string;
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
      authorized: false,
      rootBlockId: "",
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
