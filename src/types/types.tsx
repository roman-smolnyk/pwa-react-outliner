// src/types.ts
export interface BlockT {
  id: string;
  parent_id: string | null;
  content: string;
  collapsed: boolean;
  children: string[];
}

export type BlocksT = Record<string, BlockT>;

export interface FlatBlockT extends BlockT {
  depth: number;
  index: number;
}

export type FlatBlocksT = Array<BlockT>;

export interface PageT {
  page_id: string;
  parent_id: string;
  root_block_id: string;
}

export interface CollectionT {
  collection_id: string;
  parent_id: string | null;
  name: string;
  collapsed: boolean;
  children: string[];
}

export interface AccountT {
  id: string;
  root_id: string;
  inbox_id: string;
  version: number;
}
