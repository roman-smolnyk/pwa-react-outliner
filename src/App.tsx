// import { useState } from "react";
import "./App.css";
// import reactLogo from "./assets/react.svg";
import PWABadge from "./PWABadge.tsx";
// import appLogo from "/favicon.svg";
import OutlineDocument from "./components.tsx";

function App() {
  // const [count, setCount] = useState(0);

  return (
    <>
      <OutlineDocument />
      <PWABadge />
    </>
  );
}

export default App;
