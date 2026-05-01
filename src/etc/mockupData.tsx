import { createCollection, createPage, createBlock, move, insert } from "esm-treero-api";
import type { YjsManager } from "esm-treero-api";
import localConfigManager from "../config/localConfigManager";

export function fillInMockupData(yjs: YjsManager) {
  const rootId = yjs.yaccount.get("root_id");
  if (!rootId) return;

  const ycollection = createCollection(yjs.ydoc, "Mockup Data Collection");
  insert(yjs.ydoc, yjs.yexplorer, ycollection.get("id"), rootId, -1);

  for (let i = 0; i < 5; i++) {
    const ypage = createPage(yjs.ydoc, `# Mockup Data Page ${i}`);
    localConfigManager.set({ currentBlockId: ypage.get("root_id") });
    insert(yjs.ydoc, yjs.yexplorer, ypage.get("id"), ycollection.get("id"), -1);
    for (let k = 0; k < 5; k++) {
      for (const content of data) {
        const yblock = createBlock(yjs.ydoc, content);
        insert(yjs.ydoc, yjs.yblocks, yblock.get("id"), ypage.get("root_id"), -1);
      }
      let yblock = createBlock(yjs.ydoc, "Indent");
      insert(yjs.ydoc, yjs.yblocks, yblock.get("id"), ypage.get("root_id"), -1);
      for (let j = 1; j < 6; j++) {
        const id = yblock.get("id");
        yblock = createBlock(yjs.ydoc, `Level ${j}`);
        insert(yjs.ydoc, yjs.yblocks, yblock.get("id"), id, -1);
      }
    }
  }
}

const data = [
  "Single line",
  "Multiline\ntext\nmultiline\ntext",
  "", // empty line
  "Long line text. Long line text. Long line text. Long line text. Long line text. Long line text. Long line text. Long line text. Long line text. Long line text. Long line text. Long line text. Long line text. Long line text. Long line text. Long line text. Long line text. Long line text. ",
  "Loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong",
  "**bold**\n_italic_\n~strike~\n==highlight==",
  "# Heading level 1\n## Heading level 2\n### Heading level 3\n#### Heading level 4\n##### Heading level 5\n###### Heading level 6",
  "Test newlines:\n2\n\n5\n\n\n\n\n",
  "Inline code `x = 12`",
  "Multiline code:\n```js\nvar zebra = 12;\nvar bebra = 99;\nconsole.log(zebra + bebra);\n```\n\n```OneLine```\n\n```\nMissing lang\n```\n\n```js\nMissing trailing newline```",
  "Image:\n![Image](https://picsum.photos/300/200)",
  "| Syntax      | Description | Test Text     |\n| :---        |    :----:   |          ---: |\n| Header      | Title       | Here's this   |\n| Paragraph   | Text        | And more      |",
  "$$E = mc^2$$",
  "Ordered list:\n1. First item\n2. Second item\n3. Third item\n4. Fourth item",
  "Unordered list:\n- First item\n- Second item\n- Third item\n    - Indent\n- Fourth item",
  "- [x] Write the press release\n- [ ] Update the website\n- [ ] Contact the media",
  "> Dorothy followed her through many of the beautiful rooms in her castle.",
  "---",
];
