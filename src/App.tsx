import "katex/dist/katex.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

// import { Capacitor } from "@capacitor/core";
import { useEffect } from "react";
import treero from "./api/treero";
import Authorization from "./components/Authorize/Authorization";
import Main from "./components/Main/Main";
import PWABadge from "./components/PWA/PWABadge";
import useZustandStore, { hydrateZustandStateWithPreferences } from "./store/useZustandStore";

function App() {
  console.debug("App", treero.version);
  // console.log("Capacitor.isNativePlatform()", Capacitor.isNativePlatform());
  const isHydrated = useZustandStore((s) => s.isHydrated);
  const isAuthorized = useZustandStore((s) => s.isAuthorized);

  useEffect(() => {
    hydrateZustandStateWithPreferences();
  }, []);

  console.debug("isHydrated", isHydrated);
  if (!isHydrated) {
    return null;
  }

  console.debug("isAuthorized", isAuthorized);
  if (!isAuthorized) {
    return <Authorization />;
  }

  return (
    <>
      <Main />
      <PWABadge />
    </>
  );
}

export default App;
