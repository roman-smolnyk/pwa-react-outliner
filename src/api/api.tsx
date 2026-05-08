import localPreferencesManager from "../store/preferences";
import useZustandStore from "../store/useZustandStore";

export async function login(roomToken: string) {
  console.debug(`authorize`, roomToken);
  useZustandStore.setState({ authorized: true, newAccount: false });
  await localPreferencesManager.set({ roomToken: roomToken, authorized: true });
}

export function register() {
  console.debug(`register`);
  useZustandStore.setState({ authorized: true, newAccount: true });
}

export async function openBlock(id: string) {
  console.debug(`openBlock`, id);
  useZustandStore.setState({ rootBlockId: id });
  await localPreferencesManager.set({ rootBlockId: id });
}
