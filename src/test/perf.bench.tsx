import { bench, describe } from "vitest";
import { renderToString } from "react-dom/server";

function App() {
  return <div>{Array.from({ length: 1000 }, (_, i) => i)}</div>;
}

describe("render", () => {
  bench("server render", () => {
    renderToString(<App />);
  });
});
