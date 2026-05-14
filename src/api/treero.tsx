import { YjsManager } from "esm-treero-api";
import { nanoid } from "nanoid";
import yjs from "../store/yjsManager";
import localPreferencesManager from "../store/preferences";
import useZustandStore from "../store/useZustandStore";
import * as api from "./api";

declare const __APP_VERSION__: string;

const treero = {
  version: __APP_VERSION__,
  yjs: yjs,
  localPreferencesManager: localPreferencesManager,
  useZustandStore: useZustandStore,
  api: api,
};

declare global {
  interface Window {
    treero: typeof treero;
  }
}

window.treero = treero;

export default treero;
