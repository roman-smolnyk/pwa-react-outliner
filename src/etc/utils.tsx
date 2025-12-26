import { useEffect, useState } from "react";

// biome-ignore lint/suspicious/noExplicitAny: explanation
export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timerId: ReturnType<typeof setTimeout> | undefined;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

export function genRandomToken(bytes = 32) {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function useKeyboardOffset() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (!window.visualViewport) return;

    const vv = window.visualViewport;

    const update = () => {
      const overlap = Math.max(0, window.innerHeight - (vv.height + vv.offsetTop));

      setOffset(overlap);
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return offset;
}
