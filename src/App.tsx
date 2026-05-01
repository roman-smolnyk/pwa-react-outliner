import "katex/dist/katex.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import "./assets/fonts/tro.css";

import { Capacitor } from "@capacitor/core";
// import { LoginFormComponent } from "./components/AuthComp";
// import TreeRoMainComponent from "./components/TreeRoMainComp";
import { HashRouter, Routes, Route } from "react-router-dom";
import PageWindow from "./components/Page/PageWindow";
// import { useStore } from "./stateStore";

function App() {
  console.log("Capacitor.isNativePlatform()", Capacitor.isNativePlatform());
  // const authorized = useStore((state) => state.localConfig.authorized);

  // if (!authorized) {
  //   return <LoginFormComponent />;
  // }

  // return <MainAppComponent />;

  return (
    <PageWindow />
    // <HashRouter>
    //   <Routes>
    //     <Route path="/" element={<MainComp />} />
    //     <Route path="/:rootBlockId?" element={<MainComp />} />
    //   </Routes>
    // </HashRouter>
  );
}

export default App;
