type LeafValue = string | number | boolean | bigint | symbol | Date | null | undefined;

type DirectKey<T> = Extract<keyof T, string>;

type NestedKey<T> = {
  [Key in DirectKey<T>]: NonNullable<T[Key]> extends LeafValue | readonly unknown[]
    ? never
    : NonNullable<T[Key]> extends object
      ? `${Key}.${Extract<keyof NonNullable<T[Key]>, string>}`
      : never;
}[DirectKey<T>];

export type TableField<T extends object> = DirectKey<T> | NestedKey<T>;

export type TableColumnType = 'text' | 'number' | 'date' | 'currency' | 'boolean' | 'badge';
export type TableColumnAlign = 'start' | 'center' | 'end';
export type TableBadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface TableBadge {
  readonly label?: string;
  readonly tone?: TableBadgeTone;
}

export interface TableColumn<T extends object> {
  readonly field: TableField<T>;
  readonly header: string;
  readonly type?: TableColumnType;
  readonly sortable?: boolean;
  readonly width?: string;
  readonly align?: TableColumnAlign;
  readonly hideOnMobile?: boolean;
  readonly emptyValue?: string;
  readonly dateFormat?: string;
  readonly currencyCode?: string;
  readonly currencyDisplay?: 'code' | 'symbol' | 'symbol-narrow' | string;
  readonly digitsInfo?: string;
  readonly trueLabel?: string;
  readonly falseLabel?: string;
  readonly badges?: Readonly<Record<string, TableBadge>>;
  readonly valueAccessor?: (row: T) => unknown;
  readonly formatter?: (value: unknown, row: T) => string;
}
