import { fetchPwaVersion } from "@/utils/pwaUtils";
import log from "loglevel";
import { useEffect, useState } from "react";

export default function useUpdateVersion() {
  const [version, setVersion] = useState<string>("");

  useEffect(() => {
    async function fetchVersion() {
      const pwaVersion = await fetchPwaVersion();
      if (pwaVersion) setVersion(pwaVersion);
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
