import { TableField } from './table-column';

export function getNestedValue<T extends object>(row: T, field: TableField<T>): unknown {
  return String(field)
    .split('.')
    .reduce<unknown>((value, key) => {
      if (typeof value !== 'object' || value === null) {
        return undefined;
      }

      return Reflect.get(value, key);
    }, row);
}
