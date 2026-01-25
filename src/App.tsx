import "katex/dist/katex.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import "./assets/fonts/tro.css";

import { Capacitor } from "@capacitor/core";
import { TreeRoAPI } from "./api";
import { LoginFormComponent } from "./components/AuthComp";
import TreeRoMainComponent from "./components/TreeRoMainComp";
import { API } from "esm-treero-api";
import { HashRouter, Routes, Route } from "react-router-dom";

function App() {
  console.log(API.method());
  console.log("Capacitor.isNativePlatform()", Capacitor.isNativePlatform());
  TreeRoAPI.useStore((state) => state.localConfig.authorized);

  if (!TreeRoAPI.LocalConfig.get().authorized) {
    return <LoginFormComponent />;
  }

  // return <MainAppComponent />;

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<TreeRoMainComponent />} />
        <Route path="/node/:node_id?" element={<TreeRoMainComponent />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
