import { createContext, useContext, useState } from "react";

type ReadOnlyContextValue = {
  readOnly: boolean;
  setReadOnly: (v: boolean) => void;
};

const ReadOnlyContext = createContext<ReadOnlyContextValue | null>(null);

export function ReadOnlyContextProvider({ children }: { children: React.ReactNode }) {
  const [readOnly, setReadOnly] = useState<boolean>(false);

  return <ReadOnlyContext.Provider value={{ readOnly, setReadOnly }}>{children}</ReadOnlyContext.Provider>;
}

export function useReadOnly() {
  const ctx = useContext(ReadOnlyContext);
  if (!ctx) throw new Error("useReadOnly must be used inside ReadOnlyContextProvider");
  return ctx;
}
