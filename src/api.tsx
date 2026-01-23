import { useStore } from "./stateStore";
import * as Y from "yjs";
import type { TreeRoAPIType, YDocumentDataType, YGroupDataType, YNodeDataType } from "./types";
import { Yjs } from "./yjsEnv";
import { nanoid } from "nanoid";
import { LocalConfig } from "./localConfig";

export class DataNotLoadedError extends Error {}

export const TreeRoAPI: TreeRoAPIType = {
  version: "0.0.1",
  // expose to userscript
  Yjs: Yjs,
  LocalConfig: LocalConfig,
  useStore: useStore,

  clearData(reload) {
    LocalConfig.clearData();
    Yjs.idbPersistence?.clearData().then(() => {
      if (reload) {
        window.location.replace(window.location.href);
      }
    });
  },

  generateRoomToken() {
    return nanoid(64);
  },

  getRootGroupId() {
    return Yjs.ymeta!.get("root_group_id");
  },

  setRootGroupId(rootGroupId) {
    Yjs.ymeta!.set("root_group_id", rootGroupId);
  },

  // ---------------- Group Methods ----------------

  insertNewGroup(targetGroupId, name = "New Group", index = -1) {
    const group_id = nanoid();
    // const group_id = crypto.randomUUID();
    const targetYgroup = Yjs.YGroupWrap.get(targetGroupId);
    if (!targetYgroup) {
      console.error(`insertGroup: targetGroupId=${targetGroupId} is missing`);
      return null;
    }
    Yjs.ydoc!.transact(() => {
      const ygroup = new Y.Map() as YGroupDataType;
      ygroup.set("group_id", group_id);
      ygroup.set("parent_id", targetGroupId);
      ygroup.set("name", name);
      ygroup.set("collapsed", false);
      ygroup.set("children", new Y.Array<string>());

      Yjs.ygroups!.set(group_id, ygroup);
      const targetYgroupChildren = targetYgroup.children;

      let targetIndex = index < 0 ? targetYgroupChildren.length + index + 1 : index;
      targetIndex = Math.max(0, Math.min(targetIndex, targetYgroupChildren.length));
      targetYgroupChildren.insert(targetIndex, [group_id]);
    });
    return group_id;
  },

  insertNewGroupBefore(referenceId, name = "New Group") {
    const referenceYitem = Yjs.YGroupWrap.get(referenceId) || Yjs.YDocumentWrap.get(referenceId);
    if (!referenceYitem) return null;

    const parentYgroup = this.getParentGroup(referenceId);
    if (!parentYgroup) return null;
    const referenceYnodeIndex = parentYgroup.children.toArray().indexOf(referenceId);
    if (referenceYnodeIndex === -1) return null;

    const targetIndex = referenceYnodeIndex;

    return this.insertNewGroup(parentYgroup.group_id, name, targetIndex);
  },

  insertNewGroupAfter(referenceId, name = "New Group") {
    const referenceYitem = Yjs.YGroupWrap.get(referenceId) || Yjs.YDocumentWrap.get(referenceId);
    if (!referenceYitem) return null;

    const parentYgroup = this.getParentGroup(referenceId);
    if (!parentYgroup) return null;
    const referenceYnodeIndex = parentYgroup.children.toArray().indexOf(referenceId);
    if (referenceYnodeIndex === -1) return null;

    const targetIndex = referenceYnodeIndex + 1;

    return this.insertNewGroup(parentYgroup.group_id, name, targetIndex);
  },

  getGroups(groupId) {
    const groups = [];
    if (groupId) {
      const ygroup = Yjs.YGroupWrap.get(groupId);
      if (!ygroup) return [];
      for (const id of ygroup.children) {
        const item = Yjs.YGroupWrap.get(id);
        if (item) groups.push(item);
      }
    } else {
      for (const ygroup of Yjs.ygroups!.values()) {
        groups.push(new Yjs.YGroupWrap(ygroup));
      }
    }
    return groups;
  },

  getGroup(groupId) {
    return Yjs.YGroupWrap.get(groupId);
  },

  getGroupChildren(groupId) {
    const items = [];
    const ygroup = Yjs.YGroupWrap.get(groupId);
    if (!ygroup) return [];
    for (const id of ygroup.children) {
      const item = Yjs.YGroupWrap.get(id) || Yjs.YDocumentWrap.get(id);
      if (item) items.push(item);
    }
    return items;
  },

  getParentGroup(childId) {
    for (const ygroup of this.getGroups()) {
      if (ygroup.children.toArray().indexOf(childId) !== -1) {
        return ygroup;
      }
    }
    return null;
  },

  getGroupDescendantsGroupsIds(groupId) {
    const descendants: string[] = [];
    const ygroup = Yjs.YGroupWrap.get(groupId);
    if (!ygroup) return descendants;

    function _getDescendants(id: string) {
      const childYgroup = Yjs.YGroupWrap.get(id);
      if (childYgroup) {
        for (const childId of childYgroup.children) {
          descendants.push(childId);
          _getDescendants(childId);
        }
      }
    }

    _getDescendants(groupId);
    return descendants;
  },

  getGroupDescendantsDocumentsIds(groupId) {
    const descendants: string[] = [];
    const ygroup = Yjs.YGroupWrap.get(groupId);
    if (!ygroup) return descendants;

    function _getDescendants(id: string) {
      const childYgroup = Yjs.YGroupWrap.get(id);
      const childYdocument = Yjs.YDocumentWrap.get(id);
      if (childYgroup) {
        for (const childId of childYgroup.children) {
          _getDescendants(childId);
        }
      } else if (childYdocument) {
        descendants.push(id);
      }
    }

    _getDescendants(groupId);
    return descendants;
  },

  updateGroup(groupId, { name, collapsed } = {}) {
    const ygroup = Yjs.YGroupWrap.get(groupId);
    if (!ygroup) return;
    if (name) {
      Yjs.ydoc!.transact(() => {
        ygroup.name = name;
      });
    }
    if (collapsed !== undefined) {
      Yjs.ydoc!.transact(() => {
        ygroup.collapsed = collapsed;
      });
    }
  },

  moveGroup(movedGroupId, targetGroupId, index) {
    // Can't move self into self
    if (movedGroupId === targetGroupId) {
      console.error(`movedGroupId === targetGroupId`, movedGroupId, targetGroupId);
      return;
    }
    // Is it exist?
    const movedYgroup = Yjs.YGroupWrap.get(movedGroupId);
    if (!movedYgroup) {
      console.error(`movedYgroup does not exist`, movedGroupId);
      return;
    }
    // Parent exists?
    const movedYgroupParent = this.getParentGroup(movedGroupId);
    if (!movedYgroupParent) {
      console.error(`movedYgroupParent does not exist`, movedGroupId);
      return;
    }
    const movedYgroupIndex = movedYgroupParent.children.toArray().indexOf(movedGroupId);
    if (movedYgroupIndex === -1) {
      console.error(`movedYgroupIndex does not exist`, movedGroupId);
      return;
    }
    const targetYgroup = Yjs.YGroupWrap.get(targetGroupId);
    if (!targetYgroup) {
      console.error(`targetYgroup does not exist`, movedGroupId);
      return;
    }
    // Can't move it in the own children
    const descendants = this.getGroupDescendantsGroupsIds(movedGroupId);
    if (descendants.includes(targetGroupId)) {
      console.error(`Can't move group as own descendant`, movedGroupId, descendants);
      return;
    }

    if (movedYgroupParent.group_id === targetYgroup.group_id) {
      // same parent
      let targetIndex = index < 0 ? movedYgroupParent.children.length + index : index;
      targetIndex = Math.max(0, Math.min(targetIndex, movedYgroupParent.children.length));
      // No sense
      if (movedYgroupIndex === targetIndex) return;
      Yjs.ydoc!.transact(() => {
        movedYgroupParent.children.delete(movedYgroupIndex);
        movedYgroupParent.children.insert(targetIndex, [movedGroupId]);
      });
    } else {
      // other parent
      // +1 as now array will be larger
      let targetIndex = index < 0 ? targetYgroup.children.length + index + 1 : index;
      targetIndex = Math.max(0, Math.min(targetIndex, targetYgroup.children.length));
      Yjs.ydoc!.transact(() => {
        // remove node
        movedYgroupParent.children.delete(movedYgroupIndex);
        // insert node
        targetYgroup.children.insert(targetIndex, [movedGroupId]);
        movedYgroup.parent_id = targetGroupId;
      });
    }
  },

  moveGroupBefore(movedGroupId, referenceId) {
    if (movedGroupId === referenceId) return;
    const movedYgroup = Yjs.YGroupWrap.get(movedGroupId);
    if (!movedYgroup) return;
    const movedYgroupParent = this.getParentGroup(movedGroupId);
    if (!movedYgroupParent) return;
    const movedYgroupIndex = movedYgroupParent.children.toArray().indexOf(movedGroupId);
    if (movedYgroupIndex === -1) return;
    const referenceYitem = Yjs.YGroupWrap.get(referenceId) || Yjs.YDocumentWrap.get(referenceId);
    if (!referenceYitem) return;
    const referenceParentYgroup = this.getParentGroup(referenceId);
    if (!referenceParentYgroup) return;
    const referenceYitemIndex = referenceParentYgroup.children.toArray().indexOf(referenceId);
    if (referenceYitemIndex === -1) return;

    let targetIndex = movedYgroupIndex < referenceYitemIndex ? referenceYitemIndex - 1 : referenceYitemIndex;
    targetIndex = Math.max(0, targetIndex);

    return this.moveGroup(movedGroupId, referenceParentYgroup.group_id, targetIndex);
  },

  moveGroupAfter(movedGroupId, referenceId) {
    if (movedGroupId === referenceId) return;
    const movedYgroup = Yjs.YGroupWrap.get(movedGroupId);
    if (!movedYgroup) return;
    const movedYgroupParent = this.getParentGroup(movedGroupId);
    if (!movedYgroupParent) return;
    const movedYgroupIndex = movedYgroupParent.children.toArray().indexOf(movedGroupId);
    if (movedYgroupIndex === -1) return;
    const referenceYitem = Yjs.YGroupWrap.get(referenceId) || Yjs.YDocumentWrap.get(referenceId);
    if (!referenceYitem) return;
    const referenceParentYgroup = this.getParentGroup(referenceId);
    if (!referenceParentYgroup) return;
    const referenceYitemIndex = referenceParentYgroup.children.toArray().indexOf(referenceId);
    if (referenceYitemIndex === -1) return;

    let targetIndex = 0;
    if (movedYgroupParent.group_id === referenceParentYgroup.group_id) {
      targetIndex = movedYgroupIndex > referenceYitemIndex ? referenceYitemIndex + 1 : referenceYitemIndex;
    } else {
      targetIndex = referenceYitemIndex + 1;
    }

    targetIndex = Math.min(targetIndex, referenceParentYgroup.children.length);

    return this.moveGroup(movedGroupId, referenceParentYgroup.group_id, targetIndex);
  },

  deleteGroup(groupId) {
    const ygroup = Yjs.YGroupWrap.get(groupId);
    if (!ygroup) return;
    const parentYgroup = this.getParentGroup(groupId);
    if (!parentYgroup) return;
    const groupIndex = parentYgroup.children.toArray().indexOf(groupId);
    if (groupIndex === -1) return;

    const descendantsGroupsIds = this.getGroupDescendantsGroupsIds(groupId);
    const descendantsDocumentsIds = this.getGroupDescendantsDocumentsIds(groupId);
    Yjs.ydoc!.transact(() => {
      for (const id of descendantsDocumentsIds) {
        this.deleteDocument(id);
      }
      for (const id of [groupId, ...descendantsGroupsIds]) {
        Yjs.ygroups!.delete(id);
      }
      parentYgroup.children.delete(groupIndex);
    });
  },

  uiToggleGroupCollapse(groupId) {
    const ygroup = Yjs.YGroupWrap.get(groupId);
    if (!ygroup || ygroup.children.length === 0) return;
    // console.debug(ygroup.collapsed, ">", !ygroup.collapsed);
    this.updateGroup(groupId, { collapsed: !ygroup.collapsed });
  },

  // ---------------- Document Methods ----------------

  insertNewDocument(targetGroupId, rootNodeContent = "New Document", index = -1) {
    const document_id = nanoid();
    // const document_id = crypto.randomUUID();

    const targetYgroup = Yjs.YGroupWrap.get(targetGroupId);
    if (!targetYgroup) {
      console.error(`insertDocument: targetGroupId=${targetGroupId} is missing`);
      return null;
    }

    Yjs.ydoc!.transact(() => {
      const rootYnode = new Y.Map() as YNodeDataType;
      const node_id = nanoid();
      // const node_id = crypto.randomUUID();
      rootYnode.set("node_id", node_id);
      rootYnode.set("parent_id", null);
      rootYnode.set("content", new Y.Text(rootNodeContent));
      rootYnode.set("collapsed", false);
      rootYnode.set("created", Date.now());
      rootYnode.set("modified", Date.now());
      rootYnode.set("children", new Y.Array<string>());

      const ydocument = new Y.Map() as YDocumentDataType;
      ydocument.set("document_id", document_id);
      ydocument.set("parent_id", targetGroupId);
      ydocument.set("root_node_id", node_id);

      Yjs.ynodes!.set(node_id, rootYnode);
      Yjs.ydocuments!.set(document_id, ydocument);

      const targetYgroupChildren = targetYgroup.children;
      let targetIndex = index < 0 ? targetYgroupChildren.length + index + 1 : index;
      targetIndex = Math.max(0, Math.min(targetIndex, targetYgroupChildren.length));
      targetYgroupChildren.insert(targetIndex, [document_id]);
    });
    return document_id;
  },

  insertNewDocumentBefore(referenceId, rootNodeContent = "New Document") {
    const referenceYitem = Yjs.YGroupWrap.get(referenceId) || Yjs.YDocumentWrap.get(referenceId);
    if (!referenceYitem) return null;

    const parentYgroup = this.getParentGroup(referenceId);
    if (!parentYgroup) return null;
    const referenceYnodeIndex = parentYgroup.children.toArray().indexOf(referenceId);
    if (referenceYnodeIndex === -1) return null;

    const targetIndex = referenceYnodeIndex;

    return this.insertNewDocument(parentYgroup.group_id, rootNodeContent, targetIndex);
  },

  insertNewDocumentAfter(referenceId, rootNodeContent = "New Document") {
    const referenceYitem = Yjs.YGroupWrap.get(referenceId) || Yjs.YDocumentWrap.get(referenceId);
    if (!referenceYitem) return null;

    const parentYgroup = this.getParentGroup(referenceId);
    if (!parentYgroup) return null;
    const referenceYnodeIndex = parentYgroup.children.toArray().indexOf(referenceId);
    if (referenceYnodeIndex === -1) return null;

    const targetIndex = referenceYnodeIndex + 1;

    return this.insertNewDocument(parentYgroup.group_id, rootNodeContent, targetIndex);
  },

  getDocuments(groupId) {
    const documents = [];
    if (groupId) {
      const ygroup = Yjs.YGroupWrap.get(groupId);
      if (!ygroup) return [];
      for (const id of ygroup.children) {
        const item = Yjs.YDocumentWrap.get(id);
        if (item) documents.push(item);
      }
    } else {
      for (const ydocument of Yjs.ydocuments!.values()) {
        documents.push(new Yjs.YDocumentWrap(ydocument));
      }
    }
    return documents;
  },

  getDocument(documentId) {
    return Yjs.YDocumentWrap.get(documentId);
  },

  getDocumentRootNodeId(documentId) {
    const ydocument = Yjs.YDocumentWrap.get(documentId);
    if (!ydocument) return null;
    return ydocument.root_node_id;
  },

  traverseDocumentPath(documentId) {
    const path: string[] = [];
    const ydocument = Yjs.YDocumentWrap.get(documentId);
    if (!ydocument) return path;
    let ygroup = Yjs.YGroupWrap.get(ydocument.parent_id);
    while (ygroup?.parent_id) {
      path.push(ygroup.name);
      ygroup = Yjs.YGroupWrap.get(ygroup.parent_id);
    }

    return path.reverse();
  },

  updateDocument(documentId, rootNodeContent) {
    const ydocument = Yjs.YDocumentWrap.get(documentId);
    if (!ydocument) return;
    const ynode = Yjs.YNodeWrap.get(ydocument.root_node_id);
    if (!ynode) return;
    Yjs.ydoc!.transact(() => {
      ynode.content = rootNodeContent;
    });
  },

  moveDocument(movedDocumentId, targetGroupId, index) {
    // Can't move self into self
    if (movedDocumentId === targetGroupId) return;
    // Is it exist?
    const movedYdocument = Yjs.YDocumentWrap.get(movedDocumentId);
    if (!movedYdocument) return;
    // Parent exists?
    const movedYdocumentParent = this.getParentGroup(movedDocumentId);
    if (!movedYdocumentParent) return;
    const movedYdocuemntIndex = movedYdocumentParent.children.toArray().indexOf(movedDocumentId);
    if (movedYdocuemntIndex === -1) return;
    const targetYgroup = Yjs.YGroupWrap.get(targetGroupId);
    if (!targetYgroup) return;

    if (movedYdocumentParent.group_id === targetYgroup.group_id) {
      // same parent
      let targetIndex = index < 0 ? movedYdocumentParent.children.length + index : index;
      targetIndex = Math.max(0, Math.min(targetIndex, movedYdocumentParent.children.length));
      // No sense
      if (movedYdocuemntIndex === targetIndex) return;
      Yjs.ydoc!.transact(() => {
        movedYdocumentParent.children.delete(movedYdocuemntIndex);
        movedYdocumentParent.children.insert(targetIndex, [movedDocumentId]);
      });
    } else {
      // other parent
      // +1 as now array will be larger
      let targetIndex = index < 0 ? targetYgroup.children.length + index + 1 : index;
      targetIndex = Math.max(0, Math.min(targetIndex, targetYgroup.children.length));
      Yjs.ydoc!.transact(() => {
        // remove node
        movedYdocumentParent.children.delete(movedYdocuemntIndex);
        // insert node
        targetYgroup.children.insert(targetIndex, [movedDocumentId]);
        movedYdocument.parent_id = targetGroupId;
      });
    }
  },

  moveDocumentBefore(movedDocumentId, referenceId) {
    if (movedDocumentId === referenceId) return;
    const movedYdocument = Yjs.YDocumentWrap.get(movedDocumentId);
    if (!movedYdocument) return;
    const movedParentYgroup = this.getParentGroup(movedDocumentId);
    if (!movedParentYgroup) return;
    const movedYdocumentIndex = movedParentYgroup.children.toArray().indexOf(movedDocumentId);
    if (movedYdocumentIndex === -1) return;
    const referenceYitem = Yjs.YGroupWrap.get(referenceId) || Yjs.YDocumentWrap.get(referenceId);
    if (!referenceYitem) return;
    const referenceParentYgroup = this.getParentGroup(referenceId);
    if (!referenceParentYgroup) return;
    const referenceYitemIndex = referenceParentYgroup.children.toArray().indexOf(referenceId);
    if (referenceYitemIndex === -1) return;

    let targetIndex = movedYdocumentIndex < referenceYitemIndex ? referenceYitemIndex - 1 : referenceYitemIndex;
    targetIndex = Math.max(0, targetIndex);

    return this.moveDocument(movedDocumentId, referenceParentYgroup.group_id, targetIndex);
  },

  moveDocumentAfter(movedDocumentId, referenceId) {
    if (movedDocumentId === referenceId) return;
    const movedYdocument = Yjs.YDocumentWrap.get(movedDocumentId);
    if (!movedYdocument) return;
    const movedParentYgroup = this.getParentGroup(movedDocumentId);
    if (!movedParentYgroup) return;
    const movedYdocumentIndex = movedParentYgroup.children.toArray().indexOf(movedDocumentId);
    if (movedYdocumentIndex === -1) return;
    const referenceYitem = Yjs.YGroupWrap.get(referenceId) || Yjs.YDocumentWrap.get(referenceId);
    if (!referenceYitem) return;
    const referenceParentYgroup = this.getParentGroup(referenceId);
    if (!referenceParentYgroup) return;
    const referenceYitemIndex = referenceParentYgroup.children.toArray().indexOf(referenceId);
    if (referenceYitemIndex === -1) return;

    let targetIndex = 0;
    if (movedParentYgroup.group_id === referenceParentYgroup.group_id) {
      targetIndex = movedYdocumentIndex > referenceYitemIndex ? referenceYitemIndex + 1 : referenceYitemIndex;
    } else {
      targetIndex = referenceYitemIndex + 1;
    }

    targetIndex = Math.min(targetIndex, referenceParentYgroup.children.length);

    return this.moveDocument(movedDocumentId, referenceParentYgroup.group_id, targetIndex);
  },

  deleteDocument(documentId) {
    const ydocument = Yjs.YDocumentWrap.get(documentId);
    if (!ydocument) return;
    const parentYgroup = this.getParentGroup(documentId);
    if (!parentYgroup) return;
    const ydocumentIndex = parentYgroup.children.toArray().indexOf(documentId);
    if (ydocumentIndex === -1) return;

    Yjs.ydoc!.transact(() => {
      this.deleteNode(ydocument.root_node_id);
      parentYgroup.children.delete(ydocumentIndex);
      Yjs.ydocuments!.delete(documentId);
    });
  },

  // ---------------- Node Methods ----------------

  insertNewNode(targetNodeId, content = "", index = -1, args = {}) {
    const node_id = nanoid();
    // const node_id = crypto.randomUUID();

    const targetYnode = Yjs.YNodeWrap.get(targetNodeId);
    if (!targetYnode) {
      console.error(`insertDocument: targetNodeId=${targetNodeId} is missing`);
      return null;
    }

    Yjs.ydoc!.transact(() => {
      const ynode = new Y.Map() as YNodeDataType;
      ynode.set("node_id", node_id);
      ynode.set("parent_id", args?.parent_id || targetYnode.node_id);
      ynode.set("content", new Y.Text(content));
      ynode.set("collapsed", args?.collapsed || false);
      ynode.set("created", args?.created || Date.now());
      ynode.set("modified", args?.modified || Date.now());
      const arr = new Y.Array<string>();
      arr.push(args?.children || []);
      ynode.set("children", arr);

      Yjs.ynodes!.set(node_id, ynode);

      const targetYgroupChildren = targetYnode.children;
      let targetIndex = index < 0 ? targetYgroupChildren.length + index + 1 : index;
      targetIndex = Math.max(0, Math.min(targetIndex, targetYgroupChildren.length));
      targetYgroupChildren.insert(targetIndex, [node_id]);
    });
    return node_id;
  },

  insertNewNodeBefore(referenceNodeId, content = "", args = {}) {
    const referenceNode = Yjs.YNodeWrap.get(referenceNodeId);
    if (!referenceNode) return null;
    const referenceNodeParent = this.getNodeParent(referenceNodeId);
    if (!referenceNodeParent) return null;
    const referenceYnodeIndex = referenceNodeParent.children.toArray().indexOf(referenceNodeId);

    const targetIndex = referenceYnodeIndex;

    return this.insertNewNode(referenceNodeParent.node_id, content, targetIndex, args);
  },

  insertNewNodeAfter(referenceNodeId, content = "", args = {}) {
    const referenceNode = Yjs.YNodeWrap.get(referenceNodeId);
    if (!referenceNode) return null;
    const referenceNodeParent = this.getNodeParent(referenceNodeId);
    if (!referenceNodeParent) return null;
    const referenceYnodeIndex = referenceNodeParent.children.toArray().indexOf(referenceNodeId);

    const targetIndex = referenceYnodeIndex + 1;

    return this.insertNewNode(referenceNodeParent.node_id, content, targetIndex, args);
  },

  updateNode(nodeId, { content, collapsed } = {}) {
    const ynode = Yjs.YNodeWrap.get(nodeId);
    if (!ynode) return;
    Yjs.ydoc!.transact(() => {
      if (content !== undefined) {
        ynode.content = content;
      }
      if (collapsed !== undefined) {
        ynode.collapsed = collapsed;
      }
      ynode.modified = Date.now();
    });
  },

  getNodes(documentId) {
    const nodes = [];
    if (documentId) {
      const ydocument = Yjs.YDocumentWrap.get(documentId);
      if (!ydocument) return [];
      const ynode = Yjs.YNodeWrap.get(ydocument.root_node_id);
      if (!ynode) return [];
      nodes.push(ynode);
      for (const id of this.getNodeDescendantsIds(ynode.node_id)) {
        const yn = Yjs.YNodeWrap.get(id);
        if (yn) nodes.push(yn);
      }
    } else {
      for (const ynode of Yjs.ynodes!.values()) {
        nodes.push(new Yjs.YNodeWrap(ynode));
      }
    }
    return nodes;
  },

  getNode(nodeId) {
    return Yjs.YNodeWrap.get(nodeId);
  },

  getNodeChildren(nodeId) {
    const ynode = Yjs.YNodeWrap.get(nodeId);
    const children = [];
    for (const child_id of ynode?.children || []) {
      const childYnode = Yjs.YNodeWrap.get(child_id);
      if (childYnode) {
        children.push(childYnode);
      }
    }

    return children;
  },

  getNodeParent(nodeId) {
    const ynode = Yjs.YNodeWrap.get(nodeId);
    if (!ynode) return null;
    if (!ynode.parent_id) return null;
    return Yjs.YNodeWrap.get(ynode.parent_id);
  },

  getNodeSibling(nodeId, offset) {
    if (offset === 0) return null;
    if (!Yjs.ynodes!.has(nodeId)) return null;
    const nodeParent = this.getNodeParent(nodeId);
    if (!nodeParent) return null;
    const nodeIndex = nodeParent.children.toArray().indexOf(nodeId);
    if (nodeIndex === -1) return null;
    const siblingNodeId = nodeParent.children.get(nodeIndex + offset);
    if (!siblingNodeId) return null;
    return Yjs.YNodeWrap.get(siblingNodeId);
  },

  getNodeIndex(nodeId) {
    if (!Yjs.ynodes!.has(nodeId)) return null;
    const nodeParent = this.getNodeParent(nodeId);
    if (!nodeParent) return null;
    const nodeIndex = nodeParent.children.toArray().indexOf(nodeId);
    return nodeIndex;
  },

  // getNodeRootNode(nodeId) {
  //   if (!Yjs.ynodes!.has(nodeId)) return null;
  //   // Traverce to root ynode
  //   let ynode = Yjs.YNodeWrap.get(nodeId);
  //   while (ynode?.parent_id) {
  //     ynode = Yjs.YNodeWrap.get(ynode?.parent_id);
  //   }
  //   if (!ynode) return null;
  //   return ynode.node_id;
  // },

  getNodeDocumentId(nodeId) {
    if (!Yjs.ynodes!.has(nodeId)) return null;
    // Traverce to root ynode
    let ynode = Yjs.YNodeWrap.get(nodeId);
    while (ynode?.parent_id) {
      ynode = Yjs.YNodeWrap.get(ynode?.parent_id);
    }
    if (!ynode) return null;
    for (const key of Yjs.ydocuments?.keys() || []) {
      const ydocument = Yjs.YDocumentWrap.get(key);
      if (!ydocument) continue;
      if (ydocument.root_node_id === ynode.node_id) return ydocument.document_id;
      // const nodeIds = this.getNodeDescendantsIds(ydocument.root_node_id);
      // if ([ydocument.root_node_id, ...nodeIds].includes(nodeId)) {
      //   return ydocument.document_id;
      // }
    }
    return null;
  },

  getNodeDescendantsIds(nodeId) {
    const descendants: string[] = [];
    const ynode = Yjs.YNodeWrap.get(nodeId);
    if (!ynode) return descendants;

    function _getDescendants(id: string) {
      const nodeChild = Yjs.YNodeWrap.get(id);
      for (const childId of nodeChild?.children || []) {
        descendants.push(childId);
        _getDescendants(childId);
      }
    }

    _getDescendants(nodeId);
    return descendants;
  },

  traverseNodePath(nodeId) {
    const pathMap: Map<string, string> = new Map();
    let ynode = Yjs.YNodeWrap.get(nodeId);
    while (ynode?.parent_id) {
      ynode = Yjs.YNodeWrap.get(ynode?.parent_id);
      if (ynode) {
        pathMap.set(ynode.node_id, ynode.content.toString());
      }
    }

    return new Map([...pathMap].reverse());
  },

  moveNode(movedNodeId, targetNodeId, index) {
    // Can't move self into self
    if (movedNodeId === targetNodeId) {
      console.error(`movedNodeId === targetNodeId`, movedNodeId, targetNodeId);
      return;
    }
    // Is it exist?
    const movedYnode = Yjs.YNodeWrap.get(movedNodeId);
    if (!movedYnode) {
      console.error(`movedYnode does not exist`, movedNodeId);
      return;
    }
    // Parent exists?
    const movedYnodeParent = this.getNodeParent(movedNodeId);
    if (!movedYnodeParent) {
      console.error(`movedYnodeParent does not exist`, movedNodeId);
      return;
    }
    const movedYnodeIndex = movedYnodeParent.children.toArray().indexOf(movedNodeId);
    if (movedYnodeIndex === -1) {
      console.error(`movedYnodeIndex does not exist`, movedNodeId);
      return;
    }
    const targetYnode = Yjs.YNodeWrap.get(targetNodeId);
    if (!targetYnode) {
      console.error(`targetYnode does not exist`, movedNodeId);
      return;
    }
    // Can't move it in the own children
    const descendants = this.getNodeDescendantsIds(movedNodeId);
    if (descendants.includes(targetNodeId)) {
      console.error(`Can't move node as own descendant`, movedNodeId, descendants);
      return;
    }

    if (movedYnodeParent.node_id === targetYnode.node_id) {
      // same parent
      let targetIndex = index < 0 ? movedYnodeParent.children.length + index : index;
      targetIndex = Math.max(0, Math.min(targetIndex, movedYnodeParent.children.length - 1));
      // No sense
      if (movedYnodeIndex === targetIndex) return;
      Yjs.ydoc!.transact(() => {
        // console.debug(`moveNode`, { movedNodeId, targetNodeId, index, targetIndex, movedYnodeIndex });
        movedYnodeParent.children.delete(movedYnodeIndex);
        movedYnodeParent.children.insert(targetIndex, [movedNodeId]);
      });
    } else {
      // other parent
      // +1 as now array will be larger
      let targetIndex = index < 0 ? targetYnode.children.length + index + 1 : index;
      targetIndex = Math.max(0, Math.min(targetIndex, targetYnode.children.length));

      Yjs.ydoc!.transact(() => {
        // remove node
        movedYnodeParent.children.delete(movedYnodeIndex);
        // insert node
        targetYnode.children.insert(targetIndex, [movedNodeId]);
        movedYnode.parent_id = targetYnode.node_id;
      });
    }
  },

  moveNodeBefore(movedNodeId, referenceNodeId) {
    if (movedNodeId === referenceNodeId) return;
    const movedYnode = Yjs.YNodeWrap.get(movedNodeId);
    if (!movedYnode) return;
    const movedYnodeParent = this.getNodeParent(movedNodeId);
    if (!movedYnodeParent) return;
    const movedYnodeIndex = movedYnodeParent.children.toArray().indexOf(movedNodeId);
    if (movedYnodeIndex === -1) return;
    const referenceYnode = Yjs.YNodeWrap.get(referenceNodeId);
    if (!referenceYnode) return;
    const referenceYnodeParent = this.getNodeParent(referenceNodeId);
    if (!referenceYnodeParent) return;
    const referenceYnodeIndex = referenceYnodeParent.children.toArray().indexOf(referenceNodeId);
    if (referenceYnodeIndex === -1) return;

    let targetIndex = movedYnodeIndex < referenceYnodeIndex ? referenceYnodeIndex - 1 : referenceYnodeIndex;
    targetIndex = Math.max(0, targetIndex);

    return this.moveNode(movedNodeId, referenceYnodeParent.node_id, targetIndex);
  },

  moveNodeAfter(movedNodeId, referenceNodeId) {
    if (movedNodeId === referenceNodeId) return;
    const movedYnode = Yjs.YNodeWrap.get(movedNodeId);
    if (!movedYnode) return;
    const movedYnodeParent = this.getNodeParent(movedNodeId);
    if (!movedYnodeParent) return;
    const movedYnodeIndex = movedYnodeParent.children.toArray().indexOf(movedNodeId);
    if (movedYnodeIndex === -1) return;
    const referenceYnode = Yjs.YNodeWrap.get(referenceNodeId);
    if (!referenceYnode) return;
    const referenceYnodeParent = this.getNodeParent(referenceNodeId);
    if (!referenceYnodeParent) return;
    const referenceYnodeIndex = referenceYnodeParent.children.toArray().indexOf(referenceNodeId);
    if (referenceYnodeIndex === -1) return;

    let targetIndex = 0;
    if (movedYnodeParent.node_id === referenceYnodeParent.node_id) {
      targetIndex = movedYnodeIndex > referenceYnodeIndex ? referenceYnodeIndex + 1 : referenceYnodeIndex;
    } else {
      targetIndex = referenceYnodeIndex + 1;
    }

    targetIndex = Math.min(targetIndex, referenceYnodeParent.children.length);

    return this.moveNode(movedNodeId, referenceYnodeParent.node_id, targetIndex);
  },

  deleteNode(nodeId) {
    if (!nodeId) return;
    const ynode = Yjs.YNodeWrap.get(nodeId);
    if (!ynode) return;
    const ynodeParent = this.getNodeParent(nodeId);
    if (!ynodeParent) return;
    const ynodeIndex = ynodeParent.children.toArray().indexOf(nodeId);

    const descendants = this.getNodeDescendantsIds(nodeId);
    Yjs.ydoc!.transact(() => {
      ynodeParent.children.delete(ynodeIndex);
      for (const id of [nodeId, ...descendants]) {
        Yjs.ynodes!.delete(id);
      }
    });
  },

  uiIndentNode(nodeId) {
    if (!nodeId) return;
    const siblingNode = TreeRoAPI.getNodeSibling(nodeId, -1);
    if (!siblingNode) return;
    TreeRoAPI.moveNode(nodeId, siblingNode.node_id, -1);
    TreeRoAPI.updateNode(siblingNode.node_id, { collapsed: false });
    const el = document.querySelector(`.NodeContent-contenteditable[data-id="${nodeId}"]`);
    if (el) {
      const index = TreeRoAPI.useStore.getState().getCharIndexFromCaret(el as HTMLElement);
      TreeRoAPI.useStore.getState().activateNode(nodeId, index);
    }
  },

  uiUnindentNode(nodeId) {
    if (!nodeId) return;
    const nodeParent = TreeRoAPI.getNodeParent(nodeId);
    if (!nodeParent) return;
    // if (!TreeRoAPI.getNodeParent(nodeParent.parent_id as string)?.parent_id) return;
    TreeRoAPI.moveNodeAfter(nodeId, nodeParent.node_id);
    const el = document.querySelector(`.NodeContent-contenteditable[data-id="${nodeId}"]`);
    if (el) {
      const index = TreeRoAPI.useStore.getState().getCharIndexFromCaret(el as HTMLElement);
      TreeRoAPI.useStore.getState().activateNode(nodeId, index);
    }
  },

  uiMoveNodeUp(nodeId) {
    if (!nodeId) return;
    const nodeParent = TreeRoAPI.getNodeParent(nodeId);
    if (!nodeParent) return;
    const index = TreeRoAPI.getNodeIndex(nodeId);
    if (index) {
      TreeRoAPI.moveNode(nodeId, nodeParent.node_id, Math.max(0, index - 1));
    }
  },

  uiMoveNodeDown(nodeId) {
    if (!nodeId) return;
    const nodeParent = TreeRoAPI.getNodeParent(nodeId);
    if (!nodeParent) {
      console.warn(`moveNodeDown: nodeParent for ${nodeId} is missing`);
      return;
    }
    const index = TreeRoAPI.getNodeIndex(nodeId);
    if (index === null) {
      console.warn(`moveNodeDown: index for ${nodeId} is null`);
      return;
    }
    if (index != null) {
      // console.debug("moveNodeDown", index + 1);
      TreeRoAPI.moveNode(nodeId, nodeParent.node_id, index + 1);
    }
  },

  uiToggleNodeCollapse(nodeId) {
    const ynode = Yjs.YNodeWrap.get(nodeId);
    if (!ynode || ynode.children.length === 0) return;
    this.updateNode(nodeId, { collapsed: !ynode.collapsed });
  },

  uiToggleNodeDescendantsCollapse(nodeId) {
    const ynode = Yjs.YNodeWrap.get(nodeId);
    if (!ynode || ynode.children.length === 0) return;
    Yjs.ydoc!.transact(() => {
      ynode.collapsed = !ynode.collapsed;
      for (const id of this.getNodeDescendantsIds(nodeId)) {
        const yn = Yjs.YNodeWrap.get(id);
        if (yn) yn.collapsed = !ynode.collapsed;
      }
    });
  },

  uiOpenNode(nodeId) {
    this.LocalConfig.set({ currentNodeId: nodeId });
    const documentId = TreeRoAPI.getNodeDocumentId(nodeId);
    if (documentId) {
      this.LocalConfig.set({ currentDocumentId: documentId });
    }
  },
};

declare global {
  interface Window {
    TreeRoAPI: TreeRoAPIType;
  }
}

window.TreeRoAPI = TreeRoAPI;
