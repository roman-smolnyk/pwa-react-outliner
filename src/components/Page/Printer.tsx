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

      iframe.contentWindow?.focus();

      // Wait for Chromium to parse and load styles inside the iframe context
      setTimeout(() => {
        iframe.contentWindow?.print();
        useStore.setState({ idToPrint: null });
      }, 500);
    };
  }, [idToPrint]);

  return <iframe className="Printer hidden" ref={ref} title="Printer" />;
}
