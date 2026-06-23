import { useEffect, useState } from "react";

export default function useUpdateVersion() {
  const [updateVersion, setUpdateVersion] = useState<string>("");

  useEffect(() => {
    const intervalId = setInterval(
      async () => {
        if (!navigator.onLine) return;

        try {
          console.debug("useUpdateVersion:fetch");
          const response = await fetch("/version.json");
          const data = await response.json();
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
