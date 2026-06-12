import log from "loglevel";
import { useEffect } from "react";
import { toast } from "sonner";
import { useRegisterSW } from "virtual:pwa-register/react";

export default function PWABadge() {
  log.debug("PWABadge");
  // check for updates every hour
  const period = 60 * 60 * 1000;

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      log.debug("onRegisteredSW", swUrl);
      if (period <= 0) return;
      if (r?.active?.state === "activated") {
        registerPeriodicSync(period, swUrl, r);
      } else if (r?.installing) {
        r.installing.addEventListener("statechange", (e) => {
          const sw = e.target as ServiceWorker;
          if (sw.state === "activated") registerPeriodicSync(period, swUrl, r);
        });
      }
    },
  });

  function close() {
    setOfflineReady(false);
    setNeedRefresh(false);
  }

  // useEffect(() => {
  //   setOfflineReady(false);
  //   setNeedRefresh(true);
  // }, []);

  useEffect(() => {
    if (offlineReady && !needRefresh) {
      toast.info("App ready to work offline");
    } else if (needRefresh) {
      toast.info("New content available", {
        description: "Click on reload button to update",
        action: {
          label: "Reload",
          onClick: () => updateServiceWorker(true),
        },
        onDismiss: () => close(),
      });
    }
  }, [offlineReady, needRefresh]);

  return <div className="PWABadge"></div>;
}

/**
 * This function will register a periodic sync check every hour, you can modify the interval as needed.
 */
function registerPeriodicSync(period: number, swUrl: string, r: ServiceWorkerRegistration) {
  if (period <= 0) return;

  setInterval(async () => {
    if ("onLine" in navigator && !navigator.onLine) return;

    const resp = await fetch(swUrl, {
      cache: "no-store",
      headers: {
        cache: "no-store",
        "cache-control": "no-cache",
      },
    });

    if (resp?.status === 200) await r.update();
  }, period);
}
