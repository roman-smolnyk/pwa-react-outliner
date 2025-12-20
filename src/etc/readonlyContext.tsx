import { createContext, useContext, useState } from "react";

type ReadOnlyContextValue = {
  readOnly: boolean;
  setReadOnly: (v: boolean) => void;
};

const ReadOnlyContext = createContext<ReadOnlyContextValue | null>(null);

/* 2. Provider with state */
export function ReadOnlyContextProvider({ children }: { children: React.ReactNode }) {
  const [readOnly, setReadOnly] = useState<boolean>(false);

  return <ReadOnlyContext.Provider value={{ readOnly, setReadOnly }}>{children}</ReadOnlyContext.Provider>;
}

/* 3. Hook for consumption */
export function useReadOnly() {
  const ctx = useContext(ReadOnlyContext);
  if (!ctx) throw new Error("useReadOnly must be used inside ReadOnlyProvider");
  return ctx;
}
