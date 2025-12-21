import "katex/dist/katex.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import { TreeRoAPI } from "./api";

import { useEffect, useState } from "react";

import MainAppComponent from "./components/mainAppComp";

import { LoginFormComponent } from "./components/authComp";

function App() {
  TreeRoAPI.useStore((state) => state.localConfig.isAuthorized);

  if (!TreeRoAPI.isAuthorized()) {
    return <LoginFormComponent />;
  }

  return <MainAppComponent />;
}

export default App;
