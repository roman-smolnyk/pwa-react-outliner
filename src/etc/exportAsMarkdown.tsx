import * as Y from "yjs";
import { TreeRoAPI } from "../api";

type ExportOptions = {
  bullet?: string;            // default "- "
  respectCollapsed?: boolean; // default false
};

export function exportAllDocumentsAsMarkdownMap(
  options: ExportOptions = {}
): Record<string, string> {
  const { bullet = "- ", respectCollapsed = false } = options;

  const result: Record<string, string> = {};

  const rootGroupId = TreeRoAPI.Yjs.ymeta!.get("root_group_id");
  const rootGroup = TreeRoAPI.Yjs.ygroups!.get(rootGroupId);
  if (!rootGroup) {
    throw new Error("Root group not found");
  }

  exportGroupRecursive(rootGroup, "");

  return result;

  /* ---------------- helpers ---------------- */

  function exportGroupRecursive(group: Y.Map<any>, parentPath: string): void {
    const groupName = sanitize(group.get("name") || group.get("group_id"));
    const currentPath = parentPath
      ? `${parentPath}/${groupName}`
      : groupName;

    const children = group.get("children")?.toArray?.() ?? [];

    for (const id of children) {
      // Nested group
      const childGroup = TreeRoAPI.Yjs.ygroups!.get(id);
      if (childGroup) {
        exportGroupRecursive(childGroup, currentPath);
        continue;
      }

      // Document
      const doc = TreeRoAPI.Yjs.ydocuments!.get(id);
      if (!doc) continue;

      const rootNodeId = doc.get("root_node_id");
      const rootNode = TreeRoAPI.Yjs.ynodes!.get(rootNodeId);
      if (!rootNode) continue;

      const titleRaw = rootNode.get("content")?.toString?.() || "document";
      const title = sanitize(titleRaw);

      let markdown = `# ${titleRaw}\n\n`;

      const childrenNodes = rootNode.get("children")?.toArray?.() ?? [];
      for (const childId of childrenNodes) {
        markdown += renderNode(childId, 0);
      }

      const filePath = `${currentPath}/${title}.md`;
      result[filePath] = markdown.trim() + "\n";
    }
  }

  function renderNode(nodeId: string, depth: number): string {
    const node = TreeRoAPI.Yjs.ynodes!.get(nodeId);
    if (!node) return "";

    const collapsed = node.get("collapsed");
    const indent = "  ".repeat(depth);
    const content = node.get("content")?.toString?.() ?? "";

    let output = `${indent}${bullet}${content}\n`;

    if (respectCollapsed && collapsed) {
      return output;
    }

    const children = node.get("children")?.toArray?.() ?? [];
    for (const childId of children) {
      output += renderNode(childId, depth + 1);
    }

    return output;
  }

  function sanitize(name: string): string {
    return (
      name
        // biome-ignore lint/suspicious/noControlCharactersInRegex: explanation
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 128)
    );
  }
}
