import "katex/dist/katex.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import { TreeRoAPI } from "./api";
import { LoginFormComponent } from "./components/authComp";
import MainAppComponent from "./components/mainAppComp";
import { Capacitor } from "@capacitor/core";
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
