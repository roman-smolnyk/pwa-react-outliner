import "katex/dist/katex.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import "./assets/fonts/tro.css";

import { Capacitor } from "@capacitor/core";
import { TreeRoAPI } from "./api";
import { LoginFormComponent } from "./components/AuthComp";
import MainAppComponent from "./components/MainAppComp";
// import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  console.log("Capacitor.isNativePlatform()", Capacitor.isNativePlatform());
  TreeRoAPI.useStore((state) => state.localConfig.authorized);

  if (!TreeRoAPI.LocalConfig.get().authorized) {
    return <LoginFormComponent />;
  }

  return <MainAppComponent />;

  // return (
  //   <BrowserRouter>
  //     <Routes>
  //       <Route path="/:node_id?" element={<MainAppComponent />} />
  //     </Routes>
  //   </BrowserRouter>
  // );
}

export default App;
