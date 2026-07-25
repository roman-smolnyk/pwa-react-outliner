// src\utils\welcomeData.tsx
import { createBlockFromJson, createPage, deleteBlock, insertItem, type YjsManager } from "esm-treero-api";
import log from "loglevel";
import { handleBlockOpen } from "../api/api";

export async function createWelcomeData(yjs: YjsManager) {
  log.debug("fillInMockupData");
  const rootId = yjs.yaccount.get("root_id");
  if (!rootId) return;

  const ypage = createPage(yjs.ydoc, "Welcome to the Outliner by R. Smol.");
  insertItem(yjs.ydoc, yjs.yexplorer, ypage.get("id"), rootId, -1);
  deleteBlock(yjs.ydoc, ypage.get("root_id")!);
  ypage.set("root_id", rootBlockId);

  for (const block of Object.values(blocks)) {
    createBlockFromJson(yjs.ydoc, block);
  }

  await handleBlockOpen(ypage.get("root_id")!);
}

const rootBlockId = "e9qKbmHfSIuuKHnpaa1Zs";

const blocks = {
  e9qKbmHfSIuuKHnpaa1Zs: {
    id: "e9qKbmHfSIuuKHnpaa1Zs",
    parent_id: null,
    content: "# Welcome to the Outliner by R. Smol.",
    collapsed: false,
    children: [
      "PVM4h0yM81c4D8AMl3LvW",
      "srmZJmzJPVO2ma_w9wZoT",
      "ooadyIo3p6NJsdPJVC9Ch",
      "8K2Ag6CEzVUfrCzDlxdOA",
      "IqsVQ7kjwJZlBzVrSPTLM",
      "0V4C-MZEdiMM0Ak3F0q6F",
      "bDdHymmSogPvEBCScJSnz",
      "Po0rcxL3wtGvA_u8DiMJx",
      "wqyBfJj8tb_MCfIsnsQ5x",
      "FkPrErFoqm55839FT0d42",
    ],
  },
  PVM4h0yM81c4D8AMl3LvW: {
    id: "PVM4h0yM81c4D8AMl3LvW",
    parent_id: "e9qKbmHfSIuuKHnpaa1Zs",
    content: "> Here you can make notes using markdown syntax",
    collapsed: false,
    children: [],
  },
  wqyBfJj8tb_MCfIsnsQ5x: {
    id: "wqyBfJj8tb_MCfIsnsQ5x",
    parent_id: "e9qKbmHfSIuuKHnpaa1Zs",
    content: "---",
    collapsed: false,
    children: [],
  },
  FkPrErFoqm55839FT0d42: {
    id: "FkPrErFoqm55839FT0d42",
    parent_id: "e9qKbmHfSIuuKHnpaa1Zs",
    content: "Indent",
    collapsed: false,
    children: ["Urd5-lFblwIJImnK3hTD1"],
  },
  "8K2Ag6CEzVUfrCzDlxdOA": {
    id: "8K2Ag6CEzVUfrCzDlxdOA",
    parent_id: "e9qKbmHfSIuuKHnpaa1Zs",
    content: "KaTeX syntax is allowed\n$$E = mc^2$$",
    collapsed: false,
    children: [],
  },
  IqsVQ7kjwJZlBzVrSPTLM: {
    id: "IqsVQ7kjwJZlBzVrSPTLM",
    parent_id: "e9qKbmHfSIuuKHnpaa1Zs",
    content: "Tables support\n| № | Name | Age |\n| :--- | :----:     | ---:    |\n| 1 | Biba | 23 |\n| 2 | Boba | 49 |",
    collapsed: false,
    children: [],
  },
  "Urd5-lFblwIJImnK3hTD1": {
    id: "Urd5-lFblwIJImnK3hTD1",
    parent_id: "FkPrErFoqm55839FT0d42",
    content: "Level 1",
    collapsed: false,
    children: ["HBZ-vAswGxcp5mhwx3343"],
  },
  "HBZ-vAswGxcp5mhwx3343": {
    id: "HBZ-vAswGxcp5mhwx3343",
    parent_id: "Urd5-lFblwIJImnK3hTD1",
    content: "Level 2",
    collapsed: false,
    children: ["pLULVdhANAuAbor9ziQHN"],
  },
  pLULVdhANAuAbor9ziQHN: {
    id: "pLULVdhANAuAbor9ziQHN",
    parent_id: "HBZ-vAswGxcp5mhwx3343",
    content: "Level 3",
    collapsed: false,
    children: ["Ua6it3Wud7aqxG85-8dmj"],
  },
  "Ua6it3Wud7aqxG85-8dmj": {
    id: "Ua6it3Wud7aqxG85-8dmj",
    parent_id: "pLULVdhANAuAbor9ziQHN",
    content: "Level 4",
    collapsed: false,
    children: ["lwB1rH4kHcO_Pcr4iuoZP"],
  },
  lwB1rH4kHcO_Pcr4iuoZP: {
    id: "lwB1rH4kHcO_Pcr4iuoZP",
    parent_id: "Ua6it3Wud7aqxG85-8dmj",
    content: "...",
    collapsed: false,
    children: [],
  },
  srmZJmzJPVO2ma_w9wZoT: {
    id: "srmZJmzJPVO2ma_w9wZoT",
    parent_id: "e9qKbmHfSIuuKHnpaa1Zs",
    content: "# Heading level 1\n## Heading level 2\n### Heading level 3\n#### Heading level 4\n##### Heading level 5\n###### Heading level 6",
    collapsed: false,
    children: [],
  },
  ooadyIo3p6NJsdPJVC9Ch: {
    id: "ooadyIo3p6NJsdPJVC9Ch",
    parent_id: "e9qKbmHfSIuuKHnpaa1Zs",
    content: "**bold**\n_italic_\n~~strikethrough~~\n==highlight==\n||spoiler||",
    collapsed: false,
    children: [],
  },
  "0V4C-MZEdiMM0Ak3F0q6F": {
    id: "0V4C-MZEdiMM0Ak3F0q6F",
    parent_id: "e9qKbmHfSIuuKHnpaa1Zs",
    content: "Images support\n![Image](https://picsum.photos/300/200)",
    collapsed: false,
    children: [],
  },
  bDdHymmSogPvEBCScJSnz: {
    id: "bDdHymmSogPvEBCScJSnz",
    parent_id: "e9qKbmHfSIuuKHnpaa1Zs",
    content: 'Code support\n```js\nconst name = "Alex";\nconst age = 34;\nconsole.log(name, age);\n```',
    collapsed: false,
    children: [],
  },
  Po0rcxL3wtGvA_u8DiMJx: {
    id: "Po0rcxL3wtGvA_u8DiMJx",
    parent_id: "e9qKbmHfSIuuKHnpaa1Zs",
    content: "To Do Lists\n- [x] Write the press release\n- [ ] Update the website\n- [ ] Contact the media",
    collapsed: false,
    children: [],
  },
};
