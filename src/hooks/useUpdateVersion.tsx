import { useEffect, useState } from "react";

export default function useUpdateVersion() {
  const [updateVersion, setUpdateVersion] = useState<string>("");

  useEffect(() => {
    const intervalId = setInterval(
      async () => {
        if (!navigator.onLine) return;

        try {
          // Add cache-busting param
          const url = new URL("/version.json", window.location.origin);
          url.searchParams.set("v", String(Date.now()));

          const response = await fetch(url.toString());
          const data = await response.json();

          console.debug("useUpdateVersion:fetch", data);

          setUpdateVersion(data.version);
        } catch (error) {
          console.error(error);
        }
      },
      // 5 * 60 * 1000,
      5_000,
    );

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return updateVersion;
}
