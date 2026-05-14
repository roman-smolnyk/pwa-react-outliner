import "katex/dist/katex.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import "./assets/fonts/tro.css";

// import { Capacitor } from "@capacitor/core";
import Main from "./components/Main/Main";
import useZustandStore from "./store/useZustandStore";
import Authorization from "./components/Authorize/Authorization";
import PWABadge from "./components/PWA/PWABadge";
import treero from "./api/treero";

function App() {
  console.info("App", treero.version);
  // console.log("Capacitor.isNativePlatform()", Capacitor.isNativePlatform());

  const isAuthorized = useZustandStore((s) => s.isAuthorized);
  console.debug("isAuthorized", isAuthorized);

  if (!isAuthorized) {
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
