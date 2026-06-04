export type SearchEntityType =
  | 'task'
  | 'project'
  | 'comment'
  | 'member'
  | 'activity';

export interface SearchResultItem {
  id: string;
  type: SearchEntityType;
  title: string;
  subtitle?: string;
  description?: string;
  parentId?: string;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SearchResultGroup {
  type: SearchEntityType;
  label: string;
  items: SearchResultItem[];
}

export interface WorkspaceSearchResponse {
  query: string;
  total: number;
  groups: SearchResultGroup[];
}
