import "katex/dist/katex.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import "./assets/fonts/tro.css";

import { Capacitor } from "@capacitor/core";
import Main from "./components/Main/Main";
import useZustandStore from "./store/useZustandStore";
import Authorization from "./components/Authorize/Authorization";
import PWABadge from "./components/PWA/PWABadge";

function App() {
  console.log("Capacitor.isNativePlatform()", Capacitor.isNativePlatform());

  const authorized = useZustandStore((state) => state.authorized);
  // const authorized = useStore((state) => state.localPreferencesManager.authorized);

  console.debug("authorized", authorized);

  if (!authorized) {
    return <Authorization />;
  }

  // return <MainAppComponent />;

  return (
    <>
      <Main />
      <PWABadge />
    </>

    // <HashRouter>
    //   <Routes>
    //     <Route path="/" element={<MainComp />} />
    //     <Route path="/:rootBlockId?" element={<MainComp />} />
    //   </Routes>
    // </HashRouter>
  );
}

export default App;
