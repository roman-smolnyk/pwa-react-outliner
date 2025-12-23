import "katex/dist/katex.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import { TreeRoAPI } from "./api";
import { LoginFormComponent } from "./components/authComp";
import MainAppComponent from "./components/mainAppComp";
import { Capacitor } from "@capacitor/core";

function App() {
  console.log("Capacitor.isNativePlatform()", Capacitor.isNativePlatform());
  TreeRoAPI.useStore((state) => state.localConfig.isAuthorized);

  if (!TreeRoAPI.isAuthorized()) {
    return <LoginFormComponent />;
  }

  return <MainAppComponent />;
}

export default App;
