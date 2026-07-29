import log from "loglevel";
import { useEffect, useState } from "react";

export default function useUpdateVersion() {
  const [version, setVersion] = useState<string>("");

  useEffect(() => {
    async function fetchVersion() {
      if (!navigator.onLine) return;

      try {
        // const url = new URL("/version.json", window.location.origin);
        // url.searchParams.set("v", String(Date.now()));
        // url.toString()

        const response = await fetch(`${import.meta.env.BASE_URL}/version.json`);
        const data = await response.json();

        // log.debug("useUpdateVersion:fetch", data);

        setVersion(data.version);
      } catch (error) {
        // log.error(error);
      }
    }

    fetchVersion();

    const intervalId = setInterval(
      fetchVersion,
      5 * 60 * 1000,
      // 5_000,
    );

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  if (version !== __APP_VERSION__) {
    log.info(`New App version available: (${__APP_VERSION__}) => (${version})`);
  }

  return version;
}
