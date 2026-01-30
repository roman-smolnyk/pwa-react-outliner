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
  if (!ctx) throw new Error("useReadOnly must be used inside ReadOnlyContextProvider");
  return ctx;
}

type PlainTextViewContextValue = {
  plainTextView: boolean;
  setPlainTextView: (v: boolean) => void;
};

const PlainTextViewContext = createContext<PlainTextViewContextValue | null>(null);

/* 2. Provider with state */
export function PlainTextViewContextProvider({ children }: { children: React.ReactNode }) {
  const [plainTextView, setPlainTextView] = useState<boolean>(false);

  return <PlainTextViewContext.Provider value={{ plainTextView, setPlainTextView }}>{children}</PlainTextViewContext.Provider>;
}

/* 3. Hook for consumption */
export function usePlainTextView() {
  const ctx = useContext(PlainTextViewContext);
  if (!ctx) throw new Error("usePlainTextView must be used inside PlainTextViewContextProvider");
  return ctx;
}
