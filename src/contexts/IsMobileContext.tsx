import { BREAKPOINTS } from "@/utils/constants";
import type React from "react";
import { createContext, useContext } from "react";
import { useMediaQuery } from "usehooks-ts";

const IsMobileContext = createContext<boolean>(false);

export function IsMobileProvider({ children }: { children: React.ReactNode }) {
  const isMobile = !useMediaQuery(`(min-width: ${BREAKPOINTS.sm}px)`);

  return <IsMobileContext.Provider value={isMobile}>{children}</IsMobileContext.Provider>;
}

export function useIsMobile() {
  return useContext(IsMobileContext);
}
