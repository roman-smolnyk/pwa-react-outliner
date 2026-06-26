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

    let stylesHtml = "";
    document.querySelectorAll(`style, link[rel="stylesheet"]`).forEach((style) => {
      stylesHtml += style.outerHTML;
    });

    let contentHtml = "";
    const mainElement = document.querySelector(`[data-block-id="${idToPrint}"]`);
    if (mainElement) {
      contentHtml += mainElement.outerHTML;
    }
    for (const id of getItemDescendantIds(yjs.yblocks, idToPrint)) {
      const descendantElement = document.querySelector(`[data-block-id="${id}"]`);
      if (descendantElement) {
        contentHtml += descendantElement.outerHTML;
      }
    }

    iframe.addEventListener(
      "load",
      () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        useStore.setState({ idToPrint: null });
      },
      { once: true },
    );

    iframe.srcdoc = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Document</title>
          ${stylesHtml}
        </head>
        <body>
          ${contentHtml}
        </body>
      </html>
    `;
  }, [idToPrint]);

  return <iframe ref={ref} data-component="Printer" className="hidden" title="Printer" />;
}
