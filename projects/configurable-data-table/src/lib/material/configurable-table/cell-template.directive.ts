import { computed, Directive, inject, input, TemplateRef } from '@angular/core';
import { TableColumn, TableField } from '../../core/table-column';

export interface TableCellDefinition<T extends object> {
  readonly key: TableField<T>;
}

export function defineTableCell<T extends object>(key: TableField<T>): TableCellDefinition<T> {
  return { key };
}

export interface TableCellContext<T extends object> {
  readonly $implicit: T;
  readonly row: T;
  readonly value: unknown;
  readonly column: TableColumn<T>;
}

@Directive({
  selector: 'ng-template[cdtCell]',
})
export class CellTemplateDirective<T extends object> {
  readonly definition = input.required<string | TableCellDefinition<T>>({ alias: 'cdtCell' });
  readonly columnKey = computed(() => {
    const definition = this.definition();
    return typeof definition === 'string' ? definition : String(definition.key);
  });
  readonly template = inject(TemplateRef<TableCellContext<T>>);

  static ngTemplateContextGuard<T extends object>(
    _directive: CellTemplateDirective<T>,
    context: unknown,
  ): context is TableCellContext<T> {
    return true;
  }
}
