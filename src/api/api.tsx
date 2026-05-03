import useZustandStore from "../store/useZustandStore";

export function openBlock(id: string) {
  useZustandStore.setState({ rootId: id });
}
