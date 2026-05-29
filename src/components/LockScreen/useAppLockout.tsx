import { useEffect, useRef, useState } from "react";
import useZustandStore from "../../store/useZustandStore";
import log from "loglevel";
import localPreferencesManager from "../../store/preferences";

const LOCKOUT_THRESHOLD = 2 * 60 * 1000;

export function useAppLockout() {
  const lastActiveTime = useRef<number | null>(null);
  const [isPinSet, setIsPinSet] = useState(false);

  useEffect(() => {
    setTimeout(async () => {
      setIsPinSet(!!(await localPreferencesManager.get("lockScreenPin")));
    });
  }, []);

  useEffect(() => {
    // If the user hasn't set up a PIN yet, don't run the listener
    if (!isPinSet) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        log.debug("handleVisibilityChange:document.hidden");
        // User left the app (closed, minimized, or changed tab)
        lastActiveTime.current = Date.now();
      } else {
        log.debug("handleVisibilityChange:else");
        // User returned to the app
        if (lastActiveTime.current) {
          const timeElapsed = Date.now() - lastActiveTime.current;

          log.debug("handleVisibilityChange:timeElapsed", timeElapsed);

          if (timeElapsed >= LOCKOUT_THRESHOLD) {
            // Re-trigger the lock screen in your Zustand store
            useZustandStore.setState({ isLockScreenOpened: true });
          }
        }
        // Reset the tracker while they are actively using it
        lastActiveTime.current = null;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isPinSet]);
}
