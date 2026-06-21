import { createContext, useContext, useState } from "react";

type ReadOnlyContextState = {
  isReadOnly: boolean;
  setIsReadOnly: (v: boolean) => void;
};

const ReadOnlyContext = createContext<ReadOnlyContextState | null>(null);

export function ReadOnlyContextProvider({ children }: { children: React.ReactNode }) {
  const [isReadOnly, setIsReadOnly] = useState<boolean>(false);

  return <ReadOnlyContext.Provider value={{ isReadOnly, setIsReadOnly }}>{children}</ReadOnlyContext.Provider>;
}

export function useIsReadOnly() {
  const ctx = useContext(ReadOnlyContext);
  if (!ctx) throw new Error("useReadOnly must be used inside ReadOnlyContextProvider");
  return ctx;
}
