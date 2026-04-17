import "katex/dist/katex.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import "./assets/fonts/tro.css";

import { Capacitor } from "@capacitor/core";
import { LoginFormComponent } from "./components/AuthComp";
import TreeRoMainComponent from "./components/TreeRoMainComp";
import { HashRouter, Routes, Route } from "react-router-dom";
import { LocalConfig } from "./localConfig";

function App() {
  // const Yjs = initYjs();
  // console.log(Block.get("ddd"));
  // console.log(API.method());
  console.log("Capacitor.isNativePlatform()", Capacitor.isNativePlatform());
  // TreeRoAPI.useStore((state) => state.localConfig.authorized);

  if (!LocalConfig.get().authorized) {
    return <LoginFormComponent />;
  }

  // return <MainAppComponent />;

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<TreeRoMainComponent />} />
        <Route path="/block/:block_id?" element={<TreeRoMainComponent />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
