import { createContext, useContext, useState } from "react";

type ContentViewMode = "source" | "markdown" | "livePreview";

type ContentViewModeContextState = {
  contentViewMode: ContentViewMode;
  setContentViewMode: (v: ContentViewMode) => void;
};

const ContentViewModeContext = createContext<ContentViewModeContextState | null>(null);

export function ContentViewModeContextProvider({ children }: { children: React.ReactNode }) {
  const [contentViewMode, setContentViewMode] = useState<ContentViewMode>("markdown");

  return (
    <ContentViewModeContext.Provider value={{ contentViewMode: contentViewMode, setContentViewMode: setContentViewMode }}>
      {children}
    </ContentViewModeContext.Provider>
  );
}

export function useContentViewMode() {
  const ctx = useContext(ContentViewModeContext);
  if (!ctx) throw new Error("useContentViewMode must be used inside ContentViewModeContextProvider");
  return ctx;
}
