//
export function printDOM(element: HTMLElement, level = 0) {
  const logPrefix = `printDOM(${level})`;
  element.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      console.log(`${logPrefix} -> Node.TEXT_NODE`, node.nodeName, node.textContent?.replace(/\n/g, "\\n"));
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      console.log(`${logPrefix} -> Node.ELEMENT_NODE`, node.nodeName);
      printDOM(node as HTMLElement, level + 1);
    } else {
      console.log(`${logPrefix} -> ELSE`, node.nodeName);
    }
  });
}

export function getPlainTextWithNewlines(element: HTMLElement): string {
  const BLOCK_TAGS = new Set(["DIV", "P", "LI", "SECTION", "ARTICLE", "HEADER", "FOOTER", "H1", "H2", "H3", "H4", "H5", "H6"]);
  const lines: string[] = [];
  let currentLine = "";

  element.childNodes.forEach((node) => {
    console.debug(`getPlainTextWithNewlines ->`, node.nodeName, node.textContent?.replace(/\n/g, "\\n"));
    if (node.nodeType === Node.TEXT_NODE) {
      currentLine += node.textContent ?? "";
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.nodeName === "BR") {
        lines.push(currentLine);
        currentLine = "";
      } else if (BLOCK_TAGS.has(el.nodeName)) {
        // Flush current line if not empty
        if (currentLine) {
          lines.push(currentLine);
          currentLine = "";
        }
        const inner = getPlainTextWithNewlines(el);
        // Even if inner is empty, we want a blank line for empty block
        lines.push(inner);
      } else {
        // Inline element: recurse but don't break line
        currentLine += getPlainTextWithNewlines(el);
      }
    }
  });

  if (currentLine !== "" || lines.length === 0) {
    lines.push(currentLine);
  }

  // Remove trailing blank lines
  // while (lines.length > 1 && lines[lines.length - 1] === "") {
  //   lines.pop();
  // }

  return lines.join("\n");
}
