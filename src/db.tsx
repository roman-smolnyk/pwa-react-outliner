import { openDB } from "idb";
import type { IDBPDatabase } from "idb";
import type { NodeDataType, DocumentDataType, GroupDataType } from "./types"; // your types

export interface TreeRoDB {
  groups: GroupDataType;
  documents: DocumentDataType;
  nodes: NodeDataType;
}

let db: IDBPDatabase<TreeRoDB> | null = null;
export async function getDB() {
  if (db) return db;

  db = await openDB<TreeRoDB>("TreeRoDB", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("groups")) {
        db.createObjectStore("groups", { keyPath: "group_id" });
      }
      if (!db.objectStoreNames.contains("documents")) {
        db.createObjectStore("documents", { keyPath: "document_id" });
      }
      if (!db.objectStoreNames.contains("nodes")) {
        db.createObjectStore("nodes", { keyPath: "node_id" });
      }
      if (!db.objectStoreNames.contains("meta")) {
        db.createObjectStore("meta");
      }
    },
  });

  return db;
}

export const DB = {
  async resetDb() {
    // Close current connection if open
    if (db) {
      db.close();
      db = null;
    }

    // Delete the entire database
    await indexedDB.deleteDatabase("TreeRoDB");

    // Re-open and re-create stores fresh
    return getDB();
  },
  // ---------------- Meta ----------------
  async saveCurrentDocumentId(docId: string) {
    const db = await getDB();
    await db.put("meta", docId, "current_document_id");
  },

  async loadCurrentDocumentId(): Promise<string | null> {
    const db = await getDB();
    return (await db.get("meta", "current_document_id")) ?? null;
  },

  async saveRootGroupId(groupId: string) {
    const db = await getDB();
    await db.put("meta", groupId, "root_group_id");
  },

  async loadRootGroupId(): Promise<string | null> {
    const db = await getDB();
    return (await db.get("meta", "root_group_id")) ?? null;
  },
  // ------------------ Groups ------------------
  async saveGroup(group: GroupDataType) {
    const db = await getDB();
    await db.put("groups", group);
  },

  async loadGroups(): Promise<GroupDataType[]> {
    const db = await getDB();
    return db.getAll("groups");
  },

  async deleteGroup(groupId: string) {
    const db = await getDB();
    await db.delete("groups", groupId);
  },

  // ------------------ Documents ------------------
  async saveDocument(doc: DocumentDataType) {
    const db = await getDB();
    await db.put("documents", doc);
  },

  async loadDocuments(): Promise<DocumentDataType[]> {
    const db = await getDB();
    return db.getAll("documents");
  },

  async deleteDocument(docId: string) {
    const db = await getDB();
    await db.delete("documents", docId);
  },

  // ------------------ Nodes ------------------
  async saveNode(node: NodeDataType) {
    const db = await getDB();
    await db.put("nodes", node);
  },

  async loadNodes(): Promise<NodeDataType[]> {
    const db = await getDB();
    return db.getAll("nodes");
  },

  async deleteNode(nodeId: string) {
    const db = await getDB();
    await db.delete("nodes", nodeId);
  },

  // Optional: query nodes by parent or other field
  async queryNodesByPredicate(predicate: (node: NodeDataType) => boolean): Promise<NodeDataType[]> {
    const nodes = await this.loadNodes();
    return nodes.filter(predicate);
  },
};
