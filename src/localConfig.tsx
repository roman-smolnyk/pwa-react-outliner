import { useStore } from "./stateStore";
import type { LocalConfigState, LocalConfigType } from "./types";

export const LocalConfig: LocalConfigType = {
  get() {
    const defaultLocalConfig: LocalConfigState = { roomToken: "", authorized: false, workspaceId: "", currentPageId: "", currentBlockId: "" };
    return JSON.parse(localStorage.getItem("LocalConfig") ?? JSON.stringify(defaultLocalConfig));
  },

  set(localConfigPart) {
    const localConfig = LocalConfig.get();
    const { roomToken, authorized, workspaceId, currentPageId, currentBlockId } = localConfigPart;

    if (roomToken !== undefined) {
      localConfig.roomToken = roomToken;
    }
    if (authorized !== undefined) {
      localConfig.authorized = authorized;
    }
    if (workspaceId !== undefined) {
      localConfig.workspaceId = workspaceId;
    }
    if (currentPageId !== undefined) {
      localConfig.currentPageId = currentPageId;
    }
    if (currentBlockId !== undefined) {
      localConfig.currentBlockId = currentBlockId;
    }

    localStorage.setItem("LocalConfig", JSON.stringify(localConfig));
    useStore.setState({ localConfig: localConfig });
  },

  clearData() {
    localStorage.clear();
  },
};
