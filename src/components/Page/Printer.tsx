import yjs from "@/store/yjsManager";
import { getItemDescendantIds } from "esm-treero-api";
import { useEffect, useRef } from "react";
import useStore from "../../store/useStore";

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
      const contentDocument = iframe.contentDocument;
      if (!contentDocument?.body) return;

      const head = contentDocument.head;
      const body = contentDocument.body;

      // Copy styles over so Tailwind / CSS works
      document.querySelectorAll('style, link[rel="stylesheet"]').forEach((style) => {
        head.appendChild(style.cloneNode(true));
      });

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
      }, 500);
    };
  }, [idToPrint]);

  return <iframe className="Printer hidden" ref={ref} title="Printer" />;
}
