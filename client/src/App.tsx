import "katex/dist/katex.min.css";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import { TreeRoAPI } from "./api";

import { useEffect, useState } from "react";

import MainAppComponent from "./components/mainAppComp";

function SpinnerComponent() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
    </div>
  );
}

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    TreeRoAPI.initialize(() => {
      setLoading(false);
      // document.querySelector("#root > .spinner")?.remove();
    });
  }, []);

  if (loading) {
    return <SpinnerComponent />;
  }

  return <MainAppComponent />;
}

export default App;
