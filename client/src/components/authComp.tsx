import { useState } from "react";
import { TreeRoAPI } from "../api";

export function LoginFormComponent() {
  const [token, setToken] = useState("");

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center ">
      <div className="w-80 p-8 rounded-xl bg-white shadow-md ">
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
        <input
          type="text"
          placeholder="Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            onClick={(e) => {
              console.debug("Login", token);
              TreeRoAPI.setRoomToken(token);
              TreeRoAPI.setIsAuthorized(true);
            }}
          >
            Login
          </button>
          <button
            type="button"
            className="w-full bg-gray-300 text-gray-800 p-2 rounded hover:bg-gray-400"
            onClick={(e) => {
              console.debug("New Account");
              TreeRoAPI.setIsAuthorized(true);
            }}
          >
            New Account
          </button>
        </div>
      </div>
    </div>
  );
}
