import { YjsManager } from "esm-treero-api";
import { nanoid } from "nanoid";
import yjs from "../store/yjsManager";
import localPref from "../store/preferences";
import useStore from "../store/useStore";
import * as api from "./api";

const treero = {
  version: __APP_VERSION__,
  yjs: yjs,
  localPref: localPref,
  useStore: useStore,
  api: api,
};

declare global {
  interface Window {
    treero: typeof treero;
  }
}

window.treero = treero;

export default treero;
