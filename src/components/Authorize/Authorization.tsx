import { useState } from "react";
import { login, register } from "../../api/api";
import useZustandStore from "../../store/useZustandStore";
import Input from "../Common/Input";

export default function Authorization() {
  console.debug("Authorization");
  const [token, setToken] = useState("");
  const webSocketServerUrl = useZustandStore((s) => s.webSocketServerUrl);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div
        className="w-1/2 min-w-xs max-w-lg p-7
                  rounded-lg bg-popover border border-border shadow-2xl
                  flex flex-col gap-6"
      >
        <h1 className="text-center">TreeRo</h1>

        <div className="flex flex-col gap-3">
          <Input
            placeholder="WebSocket host"
            value={webSocketServerUrl}
            onChange={(e) => useZustandStore.setState({ webSocketServerUrl: e.target.value })}
          />
          <Input placeholder="Token" value={token} onChange={(e) => setToken(e.target.value)} />
        </div>

        <div className="flex gap-2 sm:gap-4">
          <button
            type="button"
            className="w-full bg-primary text-primary-foreground p-1 rounded cursor-pointer
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
            className="w-full bg-primary text-primary-foreground p-2 rounded cursor-pointer
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
