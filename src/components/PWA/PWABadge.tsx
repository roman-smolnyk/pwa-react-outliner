import { useRegisterSW } from "virtual:pwa-register/react";

export default function PWABadge() {
  console.debug("PWABadge");
  // check for updates every hour
  const period = 60 * 60 * 1000;

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
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

  return (
    <div
      className="PWABadge absolute top-15 sm:top-11 left-1/2 -translate-x-1/2 min-w-50 p-4 z-100
                bg-white border border-gray-300 rounded-lg shadow-2xl"
      role="alert"
      aria-labelledby="toast-message"
    >
      {(offlineReady || needRefresh) && (
        <div className="flex flex-col items-center justify-center text-center gap-3">
          <div className="text-xl">
            {offlineReady ? <span>App ready to work offline</span> : <span>New content available, click on reload button to update.</span>}
          </div>
          <div className="flex gap-4">
            {needRefresh && (
              <button
                className="min-w-20 p-2 font-semibold text-white
                          bg-gray-900 hover:bg-gray-700 rounded-lg shadow-md active:scale-90 transition"
                type="button"
                onClick={() => updateServiceWorker(true)}
              >
                Reload
              </button>
            )}
            <button
              className="min-w-20 p-2 font-semibold text-white
                          bg-gray-900 hover:bg-gray-700 rounded-lg shadow-md active:scale-90 transition"
              type="button"
              onClick={() => close()}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
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
