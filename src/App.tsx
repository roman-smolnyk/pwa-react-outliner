import "katex/dist/katex.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import "./assets/fonts/tro.css";

import { Capacitor } from "@capacitor/core";
import Main from "./components/Main/Main";

function App() {
  console.log("Capacitor.isNativePlatform()", Capacitor.isNativePlatform());
  // const authorized = useStore((state) => state.localConfig.authorized);

  // if (!authorized) {
  //   return <LoginFormComponent />;
  // }

  // return <MainAppComponent />;

  return (
    <Main />
    // <HashRouter>
    //   <Routes>
    //     <Route path="/" element={<MainComp />} />
    //     <Route path="/:rootBlockId?" element={<MainComp />} />
    //   </Routes>
    // </HashRouter>
  );
}

export default App;
