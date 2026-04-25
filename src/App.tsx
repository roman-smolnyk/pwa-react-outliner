import "katex/dist/katex.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import "./assets/fonts/tro.css";

import { Capacitor } from "@capacitor/core";
import { LoginFormComponent } from "./components/AuthComp";
import TreeRoMainComponent from "./components/TreeRoMainComp";
import { HashRouter, Routes, Route } from "react-router-dom";
import { useStore } from "./stateStore";

function App() {
  console.log("Capacitor.isNativePlatform()", Capacitor.isNativePlatform());
  const authorized = useStore((state) => state.localConfig.authorized);

  if (!authorized) {
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
