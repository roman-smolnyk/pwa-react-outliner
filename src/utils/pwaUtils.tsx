// pwaUtils.tsx

export function reload(hard = false) {
  if (hard) {
    const url = new URL(location.href);
    url.searchParams.set("v", String(Date.now()));
    location.replace(url);
  } else {
    location.reload(); // Soft reload from cache. History does not affected
    // location.replace(location.href); // Repalces history entry and reloads.
    // location.href = location.href; // Reloads and creates new history entry
  }
}

export async function resetPWA() {
  console.warn("resetPWA");
  if (!navigator.onLine) return;

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((reg) => reg.unregister()));

  const cacheKeys = await caches.keys();
  await Promise.all(cacheKeys.map((key) => caches.delete(key)));

  setTimeout(() => {
    reload(true);
  }, 0);
}

export async function requestPersistentStorage(): Promise<boolean> {
  if (navigator.storage?.persist) {
    const alreadyPersisted = await navigator.storage.persisted();
    if (alreadyPersisted) {
      return true;
    }

    const isGranted = await navigator.storage.persist();

    if (isGranted) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}
