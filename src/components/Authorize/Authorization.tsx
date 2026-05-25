import log from "loglevel";
import { useState } from "react";
import { login, register } from "../../api/api";
import useZustandStore from "../../store/useZustandStore";
import Input from "../Common/Input";
import PrimaryButton from "../Common/PrimaryButton";
import SecondaryButton from "../Common/SecondaryButton";

export default function Authorization() {
  log.debug("Authorization");
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

        <div className="h-10 flex gap-2 sm:gap-4">
          <PrimaryButton
            className="w-full"
            onClick={async (_) => {
              // log.debug("Login", token);
              if (token) {
                await login(webSocketServerUrl, token);
              }
            }}
          >
            Login
          </PrimaryButton>
          <SecondaryButton
            className="w-full"
            onClick={async (_) => {
              await register(webSocketServerUrl);
            }}
          >
            New Account
          </SecondaryButton>
        </div>
      </div>
    </div>
  );
}
