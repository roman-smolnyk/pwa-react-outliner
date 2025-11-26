import type { DocumentDataType, NodeDataType, GroupDataType } from "./types";

export const mockupGroup: GroupDataType = {
  group_id: "34b9de07-df5a-4bca-a153-2c0fd20cee04",
  name: "Root Group",
  collapsed: false,
  children: ["5936885c-7d05-47e2-8f65-f26c0060e431"],
};

export const mockupDocument: DocumentDataType = {
  document_id: "5936885c-7d05-47e2-8f65-f26c0060e431",
  root_node_id: "a7f6a4e2-1ddc-4e6b-bbb9-b807024da38c",
};

export const mockupNodes: NodeDataType[] = [
  {
    node_id: "a7f6a4e2-1ddc-4e6b-bbb9-b807024da38c",
    content: "# Root Node/Doc Title",
    collapsed: false,
    created: Date.now(),
    modified: Date.now(),
    children: [
      "c59226f8-80a2-4f89-b159-cd14489aff20",
      "52e0ce56-3644-4c83-bb98-5a41f0a65f1e",
      "34fb0e8a-e067-4d61-a1c6-9be803356cde",
      "fa9d932e-7d02-4c04-87b0-6aa61194f2df",
      "a5016b23-d3a3-4c09-a06a-163e894d5d88",
      "b223b265-95db-4dfc-ac9d-b27d546973f6",
      "216d9c27-0aba-4a5b-8eaa-482e6c4e8a2e",
      "e72f2a07-f85a-4710-a6aa-58f5603edf55",
      "894ca40f-57d2-42e1-a393-3b3e8f9db148",
      "371a3d38-fbce-477e-94f0-681e6ba7251c",
      "c945f6e7-b07e-4229-8ca9-6692a21d0d92",
      "3ce54b44-cb03-4342-a86f-213b6e4f1605",
      "afbbbce9-cb5c-4967-9b73-5bd1f12eda39",
    ],
  },
  {
    node_id: "c59226f8-80a2-4f89-b159-cd14489aff20",
    content: "Single line",
    collapsed: false,
    created: Date.now(),
    modified: Date.now(),
    children: [],
  },
  {
    node_id: "52e0ce56-3644-4c83-bb98-5a41f0a65f1e",
    content: "Multiline\ntext\nmultiline\ntext",
    collapsed: false,
    created: Date.now(),
    modified: Date.now(),
    children: [],
  },
  {
    node_id: "34fb0e8a-e067-4d61-a1c6-9be803356cde",
    content: "", // empty line
    collapsed: false,
    created: Date.now(),
    modified: Date.now(),
    children: [],
  },
  {
    node_id: "fa9d932e-7d02-4c04-87b0-6aa61194f2df",
    content:
      "Long line text. Long line text. Long line text. Long line text. Long line text. Long line text. Long line text. Long line text. Long line text. Long line text. Long line text. Long line text. Long line text. Long line text. Long line text. Long line text. Long line text. Long line text. ",
    collapsed: false,
    created: Date.now(),
    modified: Date.now(),
    children: [],
  },
  {
    node_id: "a5016b23-d3a3-4c09-a06a-163e894d5d88",
    content:
      "Loooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooooong",
    collapsed: false,
    created: Date.now(),
    modified: Date.now(),
    children: [],
  },
  {
    node_id: "b223b265-95db-4dfc-ac9d-b27d546973f6",
    content: "**bold**\n_italic_\n~strike~\n==highlight==",
    collapsed: false,
    created: Date.now(),
    modified: Date.now(),
    children: [],
  },
  {
    node_id: "216d9c27-0aba-4a5b-8eaa-482e6c4e8a2e",
    content: "# Heading level 1\n## Heading level 2\n### Heading level 3\n#### Heading level 4\n##### Heading level 5\n###### Heading level 6",
    collapsed: false,
    created: Date.now(),
    modified: Date.now(),
    children: [],
  },
  {
    node_id: "e72f2a07-f85a-4710-a6aa-58f5603edf55",
    content: "Test newlines:\n2\n\n5\n\n\n\n\n",
    collapsed: false,
    created: Date.now(),
    modified: Date.now(),
    children: [],
  },
  {
    node_id: "894ca40f-57d2-42e1-a393-3b3e8f9db148",
    content: "1",
    collapsed: false,
    created: Date.now(),
    modified: Date.now(),
    children: ["ec0a3754-e5bf-4201-83d6-419fb2e02135", "69dba80a-d39f-4084-8289-e70f9a746666"],
  },
  {
    node_id: "ec0a3754-e5bf-4201-83d6-419fb2e02135",
    content: "2",
    collapsed: false,
    created: Date.now(),
    modified: Date.now(),
    children: ["a1a9488a-f1da-4fba-b8d4-03b8f9c13a84"],
  },
  {
    node_id: "69dba80a-d39f-4084-8289-e70f9a746666",
    content: "2.1",
    collapsed: false,
    created: Date.now(),
    modified: Date.now(),
    children: [],
  },
  {
    node_id: "a1a9488a-f1da-4fba-b8d4-03b8f9c13a84",
    content: "3",
    collapsed: false,
    created: Date.now(),
    modified: Date.now(),
    children: ["30b98d51-c64b-42b8-a7be-e59b849758cd"],
  },
  {
    node_id: "30b98d51-c64b-42b8-a7be-e59b849758cd",
    content: "4",
    collapsed: false,
    created: Date.now(),
    modified: Date.now(),
    children: ["a5e4bc93-6c5a-4e6c-9927-9c4bf2e6ccb0"],
  },
  {
    node_id: "a5e4bc93-6c5a-4e6c-9927-9c4bf2e6ccb0",
    content: "5",
    collapsed: false,
    created: Date.now(),
    modified: Date.now(),
    children: [],
  },
  {
    node_id: "371a3d38-fbce-477e-94f0-681e6ba7251c",
    content: "Inline code `x = 12`",
    collapsed: false,
    created: Date.now(),
    modified: Date.now(),
    children: [],
  },
  {
    node_id: "c945f6e7-b07e-4229-8ca9-6692a21d0d92",
    content:
      "Multiline code:\n```js\nvar zebra = 12;\nvar bebra = 99;\nconsole.log(zebra + bebra);\n```\n\n```OneLine```\n\n```\nMissing lang\n```\n\n```js\nMissing trailing newline```",
    collapsed: false,
    created: Date.now(),
    modified: Date.now(),
    children: [],
  },
  {
    node_id: "3ce54b44-cb03-4342-a86f-213b6e4f1605",
    content: "Image:\n![Image](https://picsum.photos/300/200)",
    collapsed: false,
    created: Date.now(),
    modified: Date.now(),
    children: [],
  },
  {
    node_id: "afbbbce9-cb5c-4967-9b73-5bd1f12eda39",
    content: "| Syntax      | Description |\n| ----------- | ----------- |\n| Header      | Title       |\n| Paragraph   | Text        |",
    collapsed: false,
    created: Date.now(),
    modified: Date.now(),
    children: [],
  },
];

// export const documentSample: DocumentWithNodesDataType = {
//   document_id: "c61d23a0-58ba-485e-a090-f418c578f95e", // crypto.randomUUID()
//   root_node_id: "ce929a96-d6ce-4343-957d-6fbd49555273",
//   nodes: [
//     {
//       node_id: "ce929a96-d6ce-4343-957d-6fbd49555273",
//       content: "Document Title",
//       collapsed: false,
//       created: Date.now(),
//       modified: Date.now(),
//       children: ["1f13b621-55ac-43f6-8b00-4749b4a192cf", "857fa9b9-989e-475d-8830-ebadd721304a", "857fa9b9-989e-475d-8830-ebadd7213042"],
//     },
//     {
//       node_id: "1f13b621-55ac-43f6-8b00-4749b4a192cf",
//       content: "Some simple text",
//       collapsed: false,
//       created: Date.now(),
//       modified: Date.now(),
//       children: ["2fc4bbbb-0a5c-4f80-8eed-b9e7d337570c"],
//     },
//     {
//       node_id: "857fa9b9-989e-475d-8830-ebadd721304a",
//       content: "```js\nx = 12;\n```",
//       collapsed: false,
//       created: Date.now(),
//       modified: Date.now(),
//       children: [],
//     },
//     {
//       node_id: "857fa9b9-989e-475d-8830-ebadd7213042",
//       content: "`x = 12`\n\nThis is <b>bold</b> and <i>italic</i>.",
//       collapsed: false,
//       created: Date.now(),
//       modified: Date.now(),
//       children: [],
//     },
//     {
//       node_id: "2fc4bbbb-0a5c-4f80-8eed-b9e7d337570c",
//       content: "Nested node",
//       collapsed: false,
//       created: Date.now(),
//       modified: Date.now(),
//       children: [],
//     },
//   ],
// };

// export const outlinerStructureSample: OutlinerStructureDataType = {
//   current_document_id: "c61d23a0-58ba-485e-a090-f418c578f95e",
//   root_group_id: "6483444f-71cb-4027-a9a1-065264369987",
//   groups: [
//     {
//       group_id: "6483444f-71cb-4027-a9a1-065264369987",
//       name: "Untitled",
//       collapsed: false,
//       children: ["c61d23a0-58ba-485e-a090-f418c578f95e"],
//     },
//   ],
//   documents: [documentSample],
// };
