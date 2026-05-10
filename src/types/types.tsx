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

export type FlatBlocksT = Array<FlatBlockT>;

export interface ExpEntryT {
  id: string;
  type: 1 | 2;
  parent_id: string | null | undefined;
  title: string;

  root_id: string | undefined;
  name: string | undefined;
  collapsed: boolean | undefined;
  children: string[] | undefined;
}

export interface FlatExpEntryT extends ExpEntryT {
  depth: number;
  index: number;
}

export type FlatExplorerT = Array<FlatExpEntryT>;

export interface PageT {
  id: string;
  parent_id: string;
  root_id: string;
}

export interface FlatPageT extends PageT {
  depth: number;
  index: number;
}

export interface CollectionT {
  id: string;
  parent_id: string | null;
  name: string;
  collapsed: boolean;
  children: string[];
}

export interface FlatCollectionT extends CollectionT {
  depth: number;
  index: number;
}

// export type FlatExplorerT = Array<FlatPageT | FlatCollectionT>;

export interface AccountT {
  id: string;
  root_id: string;
  inbox_id: string;
  version: number;
}
