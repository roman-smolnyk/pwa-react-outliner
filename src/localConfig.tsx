import { useStore } from "./stateStore";
import type { LocalConfigStateType, LocalConfigType } from "./types";

export const LocalConfig: LocalConfigType = {
  get() {
    const defaultLocalConfig: LocalConfigStateType = { roomToken: "", authorized: false, currentDocumentId: "", currentNodeId: "" };
    return JSON.parse(localStorage.getItem("LocalConfig") ?? JSON.stringify(defaultLocalConfig));
  },

  set(localConfigPart) {
    const localConfig = LocalConfig.get();
    const { roomToken, authorized, currentDocumentId, currentNodeId: currentNodeid } = localConfigPart;

    if (roomToken !== undefined) {
      localConfig.roomToken = roomToken;
    }
    if (authorized !== undefined) {
      localConfig.authorized = authorized;
    }
    if (currentDocumentId !== undefined) {
      localConfig.currentDocumentId = currentDocumentId;
    }
    if (currentNodeid !== undefined) {
      localConfig.currentNodeId = currentNodeid;
    }

    localStorage.setItem("LocalConfig", JSON.stringify(localConfig));
    useStore.setState({ localConfig: localConfig });
  },
};
