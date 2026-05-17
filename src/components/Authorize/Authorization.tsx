import { useState } from "react";
import { WS_SERVER_URL } from "../../../config";
import { login, register } from "../../api/api";
import useZustandStore from "../../store/useZustandStore";

export default function Authorization() {
  console.debug("Authorization");
  const [token, setToken] = useState("");
  const webSocketServerUrl = useZustandStore((s) => s.webSocketServerUrl);

  return (
    <div className="min-h-screen bg-theme-bg-subtle flex items-center justify-center ">
      <div className="min-w-50 sm:min-w-100 m-5 py-8 px-4 sm:px-8 rounded-xl bg-theme-bg shadow-md ">
        <h1 className="font-bold mb-4 text-center">TreeRo</h1>
        <input
          className="w-full p-2 mb-4 rounded border border-theme-border focus:outline-none focus:ring focus:border-theme-ring"
          type="text"
          placeholder="WebSocket host"
          value={webSocketServerUrl}
          onChange={(e) => useZustandStore.setState({ webSocketServerUrl: e.target.value })}
          // onBlur={() => (!webSocketServerUrl ? useZustandStore.setState({ webSocketServerUrl: WS_SERVER_URL }) : null)}
        />
        <input
          className="w-full p-2 mb-4 rounded border border-theme-border focus:outline-none focus:ring focus:border-theme-ring"
          type="text"
          placeholder="Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <div className="flex gap-2 sm:gap-4">
          <button
            type="button"
            className="w-full bg-theme-primary text-theme-primary-fg p-2 rounded cursor-pointer
                      hover:scale-105 active:scale-100 transition-transform"
            onClick={async (_) => {
              // console.debug("Login", token);
              if (token) {
                await login(webSocketServerUrl, token);
              }
            }}
          >
            Login
          </button>
          <button
            type="button"
            className="w-full bg-theme-primary text-theme-primary-fg p-2 rounded cursor-pointer
                      hover:scale-105 active:scale-100 transition-transform"
            onClick={async (_) => {
              await register(webSocketServerUrl);
            }}
          >
            New Account
          </button>
        </div>
      </div>
    </div>
  );
}
