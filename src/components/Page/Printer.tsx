import yjs from "@/store/yjsManager";
import { getItemDescendantIds } from "esm-treero-api";
import { useEffect, useRef } from "react";
import useStore from "../../store/useStore";

const copyStylesToIframe = (iframe: HTMLIFrameElement): Promise<void> => {
  const contentDocument = iframe.contentDocument;
  if (!contentDocument) return Promise.reject("No iframe document");

  const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));

  if (styles.length === 0) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let loadedCount = 0;
    let linkCount = 0; // Count only <link> tags

    styles.forEach((style) => {
      const clone = style.cloneNode(true) as HTMLElement;

      if (clone.tagName === "LINK") {
        linkCount++;

        const onLoad = () => {
          loadedCount++;
          if (loadedCount === linkCount) resolve();
        };

        clone.addEventListener("load", onLoad, { once: true });
        clone.addEventListener("error", onLoad, { once: true });
      }

      contentDocument.head.appendChild(clone);
    });

    // If no <link> tags, resolve immediately
    if (linkCount === 0) {
      resolve();
    }

    setTimeout(() => resolve(), 1000);
  });
};

export default function Printer() {
  const ref = useRef<HTMLIFrameElement>(null);

  const idToPrint = useStore((s) => s.idToPrint);

  useEffect(() => {
    // log.debug("Printer:useEffect", idToPrint);
    const iframe = ref.current;
    if (!idToPrint || !iframe) return;

    iframe.srcdoc = `
      <html>
        <head><title>Print Document</title></head>
        <body></body>
      </html>
    `;

    iframe.onload = async () => {
      const contentDocument = iframe.contentDocument;
      if (!contentDocument?.body) return;

      // const head = contentDocument.head;
      const body = contentDocument.body;

      // Copy styles over so Tailwind / CSS works
      await copyStylesToIframe(iframe);

      const element = document.querySelector(`[data-block-id="${idToPrint}"]`);
      if (element) {
        body.appendChild(contentDocument.importNode(element, true));
      }

      for (const id of getItemDescendantIds(yjs.yblocks, idToPrint)) {
        const element = document.querySelector(`[data-block-id="${id}"]`);
        if (element) {
          body.appendChild(contentDocument.importNode(element, true));
        }
      }

      iframe.contentWindow?.focus();

      // Wait for Chromium to parse and load styles inside the iframe context
      setTimeout(() => {
        iframe.contentWindow?.print();
        useStore.setState({ idToPrint: null });
      }, 750);
    };
  }, [idToPrint]);

  return <iframe className="Printer hidden" ref={ref} title="Printer" />;
}
