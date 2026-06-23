import { useEffect, useRef } from "react";
import useStore from "../../store/useStore";
import { getItemDescendantIds } from "esm-treero-api";
import yjs from "@/store/yjsManager";

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

    iframe.onload = () => {
      const iframeDoc = iframe.contentDocument;
      if (!iframeDoc || !iframeDoc.body) return;

      const body = iframeDoc.body;

      // Copy styles over so Tailwind / CSS works
      document.querySelectorAll('style, link[rel="stylesheet"]').forEach((style) => {
        iframeDoc.head.appendChild(style.cloneNode(true));
      });

      const element = document.querySelector(`[data-block-id="${idToPrint}"]`);
      if (element) {
        body.appendChild(iframeDoc.importNode(element, true));
      }

      for (const id of getItemDescendantIds(yjs.yblocks, idToPrint)) {
        const element = document.querySelector(`[data-block-id="${id}"]`);
        if (element) {
          body.appendChild(iframeDoc.importNode(element, true));
        }
      }

      // CRITICAL FIX: Wait for Chromium to parse and load the fonts inside the iframe context
      if (iframe.contentWindow) {
        iframe.contentWindow.focus();

        // Check if the fonts ready API is available in the iframe's document
        if (iframeDoc.fonts?.ready) {
          console.debug("iframeDoc.fonts?.ready");
          iframeDoc.fonts.ready.then(() => {
            // A tiny timeout gives Chromium an extra frame to paint the list styles correctly
            setTimeout(() => {
              iframe.contentWindow?.print();
              useStore.setState({ idToPrint: null });
            }, 100);
          });
        } else {
          console.debug("iframeDoc.fonts?.ready ELSE");
          // Fallback for older browsers
          setTimeout(() => {
            iframe.contentWindow?.print();
            useStore.setState({ idToPrint: null });
          }, 100);
        }
      }
    };
  }, [idToPrint]);

  return <iframe className="Printer hidden" ref={ref} title="Printer" />;
}
