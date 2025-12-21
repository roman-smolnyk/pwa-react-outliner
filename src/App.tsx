import "katex/dist/katex.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import { TreeRoAPI } from "./api";
import { LoginFormComponent } from "./components/authComp";
import MainAppComponent from "./components/mainAppComp";

function App() {
  TreeRoAPI.useStore((state) => state.localConfig.isAuthorized);

  if (!TreeRoAPI.isAuthorized()) {
    return <LoginFormComponent />;
  }

  return <MainAppComponent />;
}

export default App;
