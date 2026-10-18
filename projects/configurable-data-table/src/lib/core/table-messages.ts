export interface TableMessages {
  readonly filterLabel: string;
  readonly filterPlaceholder: string;
  readonly clearFilterLabel: string;
  readonly actionsHeader: string;
  readonly emptyTitle: string;
  readonly emptyDescription: string;
  readonly errorTitle: string;
  readonly retryLabel: string;
  readonly loadingLabel: string;
  readonly recordSingular: string;
  readonly recordPlural: string;
  readonly selectRowLabel: string;
  readonly selectAllLabel: string;
}

export const DEFAULT_TABLE_MESSAGES: TableMessages = {
  filterLabel: 'Search',
  filterPlaceholder: 'Search records',
  clearFilterLabel: 'Clear search',
  actionsHeader: 'Actions',
  emptyTitle: 'No records found',
  emptyDescription: 'Try changing the current search or filters.',
  errorTitle: 'Unable to load records',
  retryLabel: 'Try again',
  loadingLabel: 'Loading records',
  recordSingular: 'record',
  recordPlural: 'records',
  selectRowLabel: 'Select row',
  selectAllLabel: 'Select all rows on this page',
};
