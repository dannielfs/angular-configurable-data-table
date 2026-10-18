export type TableActionTone = 'neutral' | 'primary' | 'danger';

export interface TableAction<T extends object> {
  readonly id: string;
  readonly label: string;
  readonly icon?: string;
  readonly tone?: TableActionTone;
  readonly disabled?: (row: T) => boolean;
  readonly hidden?: (row: T) => boolean;
}

export interface TableActionEvent<T extends object> {
  readonly action: TableAction<T>;
  readonly row: T;
}
