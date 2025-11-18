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
    content: "Root Node/Doc Title",
    collapsed: false,
    created: Date.now(),
    modified: Date.now(),
    children: ["c59226f8-80a2-4f89-b159-cd14489aff20"],
  },
  {
    node_id: "c59226f8-80a2-4f89-b159-cd14489aff20",
    content: "```js\nx = 12```",
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
