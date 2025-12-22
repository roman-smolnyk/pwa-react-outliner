import { useEffect, useState } from "react";

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
