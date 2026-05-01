export interface LocalConfig {
  roomToken: string;
  authorized: boolean;
  currentPageId: string;
  currentBlockId: string;
}

export interface LocalConfigManager {
  localStorageKey: string;
  get(): LocalConfig;
  set(localConfig: Partial<LocalConfig>): void;
  clear: () => void;
}

const localConfigManager: LocalConfigManager = {
  localStorageKey: "localConfig",

  get() {
    const defaultLocalConfig: LocalConfig = { roomToken: "", authorized: false, currentPageId: "", currentBlockId: "" };
    return JSON.parse(localStorage.getItem(localConfigManager.localStorageKey) ?? JSON.stringify(defaultLocalConfig));
  },

  set(localConfigPart) {
    console.debug("localConfigManager.set()", localConfigPart);
    const localConfig = localConfigManager.get();
    const { roomToken, authorized, currentPageId, currentBlockId } = localConfigPart;

    if (roomToken !== undefined) {
      localConfig.roomToken = roomToken;
    }
    if (authorized !== undefined) {
      console.debug("set authorized", authorized);
      localConfig.authorized = authorized;
    }
    if (currentPageId !== undefined) {
      localConfig.currentPageId = currentPageId;
    }
    if (currentBlockId !== undefined) {
      localConfig.currentBlockId = currentBlockId;
    }

    localStorage.setItem(localConfigManager.localStorageKey, JSON.stringify(localConfig));
  },

  clear() {
    localStorage.clear();
  },
};

export default localConfigManager;
