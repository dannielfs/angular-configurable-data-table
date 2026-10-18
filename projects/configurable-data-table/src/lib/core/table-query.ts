export type TableSortDirection = 'asc' | 'desc';

export interface TableSort {
  readonly active: string;
  readonly direction: TableSortDirection;
}

export interface TableQuery {
  readonly pageIndex: number;
  readonly pageSize: number;
  readonly filter: string;
  readonly sort: TableSort | null;
}
