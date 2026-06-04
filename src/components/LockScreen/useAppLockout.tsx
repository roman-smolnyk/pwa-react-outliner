import { useEffect, useRef, useState } from "react";
import useZustandStore from "../../store/useZustandStore";
import log from "loglevel";

export function useAppLockout() {
  const lastActiveTime = useRef<number | null>(null);

  const autoLockScreen = useZustandStore((s) => s.autoLockScreen);

  useEffect(() => {
    if (autoLockScreen === -1) return;

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

          if (timeElapsed >= autoLockScreen) {
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
  }, [autoLockScreen]);
}
