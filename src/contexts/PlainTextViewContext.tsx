import { createContext, useContext, useState } from "react";

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
