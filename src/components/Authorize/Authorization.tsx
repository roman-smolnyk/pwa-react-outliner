import { useState } from "react";
import { login, register, saveWsUrl } from "../../api/api";
import useZustandStore from "../../store/useZustandStore";
import { WS_SERVER_URL } from "../../../config";

export default function Authorization() {
  console.debug("Authorization");
  const [token, setToken] = useState("");
  const webSocketServerUrl = useZustandStore((s) => s.webSocketServerUrl);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center ">
      <div className="min-w-50 sm:min-w-100 py-8 px-2 sm:px-8 m-2 rounded-xl bg-white shadow-md ">
        <h1 className="text-2xl font-bold mb-4 text-center">TreeRo</h1>
        <input
          className="w-full p-2 mb-4 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-600"
          type="text"
          placeholder="WebSocket host"
          value={webSocketServerUrl}
          onChange={(e) => useZustandStore.setState({ webSocketServerUrl: e.target.value })}
          onBlur={() => (!webSocketServerUrl ? useZustandStore.setState({ webSocketServerUrl: WS_SERVER_URL }) : null)}
        />
        <input
          className="w-full p-2 mb-4 rounded border border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-600"
          type="text"
          placeholder="Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="w-full bg-black text-white p-2 rounded transition-transform hover:scale-105 active:scale-100"
            onClick={(_) => {
              // console.debug("Login", token);
              if (token) {
                login(token);
                saveWsUrl(webSocketServerUrl);
              }
            }}
          >
            Login
          </button>
          <button
            type="button"
            className="w-full bg-gray-300 text-gray-800 p-2 rounded transition-transform hover:scale-105 active:scale-100"
            onClick={(_) => {
              register();
              saveWsUrl(webSocketServerUrl);
            }}
          >
            New Account
          </button>
        </div>
      </div>
    </div>
  );
}
