import "katex/dist/katex.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import log from "loglevel";
import { useEffect } from "react";
import treero from "./api/treero";
import Authorization from "./components/Authorize/Authorization";
import LockScreen from "./components/LockScreen/LockScreen";
import Main from "./components/Main/Main";
import PWABadge from "./components/PWA/PWABadge";
import { LOG_LEVEL } from "./config";
import { ConfirmationProvider } from "./contexts/ConfirmationContext";
import { ContentViewModeContextProvider } from "./contexts/ContentViewModeContext";
import { IsMobileProvider } from "./contexts/IsMobileContext";
import { ReadOnlyContextProvider } from "./contexts/ReadOnlyContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAppLockout } from "./hooks/useAppLockout";
import useStore, { hydrateZustandStateWithPreferences } from "./store/useStore";
import { requestPersistentStorage } from "./utils/pwaUtils";

function App() {
  console.info(`App`, { version: treero.version, LOG_LEVEL: LOG_LEVEL });
  const isHydrated = useStore((s) => s.isHydrated);
  const isAuthorized = useStore((s) => s.isAuthorized);
  const isLockScreenOpen = useStore((s) => s.isLockScreenOpen);

  useAppLockout();

  useEffect(() => {
    requestPersistentStorage();
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      hydrateZustandStateWithPreferences();
    }
  }, [isHydrated]);

  log.debug("isHydrated", isHydrated);
  if (!isHydrated) {
    return null;
  }

  log.debug("isAuthorized", isAuthorized);

  return (
    <ThemeProvider>
      <IsMobileProvider>
        <ReadOnlyContextProvider>
          <ContentViewModeContextProvider>
            <TooltipProvider delay={500}>
              <ConfirmationProvider>
                {isAuthorized ? isLockScreenOpen ? <LockScreen /> : <Main /> : <Authorization />}
                <PWABadge />
                <Toaster className="top-15!" position="top-right" duration={3_000} />
              </ConfirmationProvider>
            </TooltipProvider>
          </ContentViewModeContextProvider>
        </ReadOnlyContextProvider>
      </IsMobileProvider>
    </ThemeProvider>
  );
}

export default App;
