import { useState } from "react";
import { LocalConfig } from "../localConfig";

export function LoginFormComponent() {
  const [token, setToken] = useState("");

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center ">
      <div className="w-80 p-8 rounded-xl bg-white shadow-md ">
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
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
                LocalConfig.set({ roomToken: token });
                LocalConfig.set({ authorized: true });
              }
            }}
          >
            Login
          </button>
          <button
            type="button"
            className="w-full bg-gray-300 text-gray-800 p-2 rounded transition-transform hover:scale-105 active:scale-100"
            onClick={(_) => {
              // console.debug("New Account");
              LocalConfig.set({ authorized: true });
            }}
          >
            New Account
          </button>
        </div>
      </div>
    </div>
  );
}
