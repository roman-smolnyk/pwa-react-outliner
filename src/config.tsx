import type { LogLevelNames } from "loglevel";
import log from "loglevel";

// "https://y-websocket-server-t1tj.onrender.com"
export const WS_SERVER_URL = "wss://y-websocket-server-t1tj.onrender.com";
export const INDENT = 20;

let LOG_LEVEL: LogLevelNames;
if (import.meta.env.DEV) {
  log.setLevel("debug");
  LOG_LEVEL = "debug";
} else {
  // log.setLevel("warn");
  // LOG_LEVEL = "warn";
  log.setLevel("debug");
  LOG_LEVEL = "debug";
}
export { LOG_LEVEL };

