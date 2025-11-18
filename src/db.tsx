import { openDB } from "idb";
import type { IDBPDatabase } from "idb";
import type { NodeDataType, DocumentDataType, GroupDataType, TreeRoIndexedDbType, IDBApiType } from "./types"; // your types

let db: IDBPDatabase<TreeRoIndexedDbType> | null = null;
export async function getDB() {
  if (db) return db;

  db = await openDB<TreeRoIndexedDbType>("TreeRoDB", 1, {
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

export const IDBApi: IDBApiType = {
  logPrefix: "IDBApi",

  async resetDb() {
    console.debug(`${this.logPrefix}.resetDb`);
    // Close current connection if open
    if (db) {
      db.close();
      db = null;
    }

    // Delete the entire database
    await indexedDB.deleteDatabase("TreeRoDB");
    // Re-open and re-create stores fresh
    // getDB();
  },
  // ---------------- Meta ----------------
  async saveCurrentDocumentId(docId: string) {
    console.debug(`${this.logPrefix}.saveCurrentDocumentId`, docId);
    const db = await getDB();
    await db.put("meta", docId, "current_document_id");
  },

  async loadCurrentDocumentId(): Promise<string | null> {
    console.debug(`${this.logPrefix}.loadCurrentDocumentId`);
    const db = await getDB();
    return (await db.get("meta", "current_document_id")) ?? null;
  },

  async saveRootGroupId(groupId: string) {
    console.debug(`${this.logPrefix}.saveRootGroupId`, groupId);
    const db = await getDB();
    await db.put("meta", groupId, "root_group_id");
  },

  async loadRootGroupId(): Promise<string | null> {
    console.debug(`${this.logPrefix}.loadRootGroupId`);
    const db = await getDB();
    return (await db.get("meta", "root_group_id")) ?? null;
  },
  // ------------------ Groups ------------------
  async saveGroup(group: GroupDataType) {
    console.debug(`${this.logPrefix}.saveGroup`, group);
    const db = await getDB();
    await db.put("groups", group);
  },

  async loadGroups(): Promise<GroupDataType[]> {
    console.debug(`${this.logPrefix}.loadGroups`);
    const db = await getDB();
    return db.getAll("groups");
  },

  async deleteGroup(groupId: string) {
    console.debug(`${this.logPrefix}.deleteGroup`);
    const db = await getDB();
    await db.delete("groups", groupId);
  },

  // ------------------ Documents ------------------
  async saveDocument(doc: DocumentDataType) {
    console.debug(`${this.logPrefix}.saveDocument`);
    const db = await getDB();
    await db.put("documents", doc);
  },

  async loadDocuments(): Promise<DocumentDataType[]> {
    console.debug(`${this.logPrefix}.loadDocuments`);
    const db = await getDB();
    return db.getAll("documents");
  },

  async deleteDocument(docId: string) {
    console.debug(`${this.logPrefix}.deleteDocument`, docId);
    const db = await getDB();
    await db.delete("documents", docId);
  },

  // ------------------ Nodes ------------------
  async saveNode(node: NodeDataType) {
    console.debug(`${this.logPrefix}.saveNode`, node);
    const db = await getDB();
    await db.put("nodes", node);
  },

  async saveNodes(nodes: NodeDataType | NodeDataType[]) {
    console.debug(`${this.logPrefix}.saveNodes`, nodes);
    const db = await getDB();
    const tx = db.transaction("nodes", "readwrite");
    const store = tx.objectStore("nodes");

    const nodesArray = Array.isArray(nodes) ? nodes : [nodes];

    for (const node of nodesArray) {
      store.put(node);
    }

    await tx.done; // wait for the transaction to finish
  },

  async loadNodes(): Promise<NodeDataType[]> {
    console.debug(`${this.logPrefix}.loadNodes`);
    const db = await getDB();
    return db.getAll("nodes");
  },

  async deleteNode(nodeId: string) {
    console.debug(`${this.logPrefix}.deleteNode`, nodeId);
    const db = await getDB();
    await db.delete("nodes", nodeId);
  },

  async deleteNodes(nodeIds: string | string[]) {
    console.debug(`${this.logPrefix}.deleteNodes`, nodeIds);
    const db = await getDB();
    const tx = db.transaction("nodes", "readwrite");
    const store = tx.objectStore("nodes");

    const idsArray = Array.isArray(nodeIds) ? nodeIds : [nodeIds];

    for (const id of idsArray) {
      store.delete(id);
    }

    await tx.done; // wait for all deletes to complete
  },

  async queryNodesByPredicate(predicate: (node: NodeDataType) => boolean): Promise<NodeDataType[]> {
    console.debug(`${this.logPrefix}.queryNodesByPredicate`);
    const nodes = await this.loadNodes();
    return nodes.filter(predicate);
  },
};
