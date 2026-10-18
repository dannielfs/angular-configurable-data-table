import { CurrencyPipe, DatePipe, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  contentChildren,
  input,
  linkedSignal,
  OnDestroy,
  output,
  TemplateRef,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { getNestedValue } from '../../core/nested-value';
import { TableAction, TableActionEvent } from '../../core/table-action';
import { TableBadge, TableColumn } from '../../core/table-column';
import { DEFAULT_TABLE_MESSAGES, TableMessages } from '../../core/table-messages';
import { TableQuery, TableSort } from '../../core/table-query';
import { TableSelectionMode } from '../../core/table-selection';
import { CellTemplateDirective, TableCellContext } from './cell-template.directive';

@Component({
  selector: 'cdt-table',
  imports: [
    CurrencyPipe,
    DatePipe,
    NgTemplateOutlet,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatTableModule,
    MatTooltipModule,
  ],
  templateUrl: './configurable-table.html',
  styleUrl: './configurable-table.scss',
})
export class ConfigurableTable<T extends object = Record<string, unknown>> implements OnDestroy {
  readonly data = input.required<readonly T[]>();
  readonly columns = input.required<readonly TableColumn<T>[]>();
  readonly actions = input<readonly TableAction<T>[]>([]);
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly title = input('');
  readonly ariaLabel = input('Data table');
  readonly filterable = input(true);
  readonly filter = input('');
  readonly filterDebounce = input(300);
  readonly showAddButton = input(false);
  readonly addLabel = input('Add record');
  readonly addIcon = input('add');
  readonly totalRecords = input(0);
  readonly showPaginator = input(true);
  readonly pageIndex = input(0);
  readonly pageSize = input(10);
  readonly pageSizeOptions = input<readonly number[]>([5, 10, 25, 50]);
  readonly showFirstLastButtons = input(true);
  readonly sort = input<TableSort | null>(null);
  readonly locale = input('en-US');
  readonly messages = input<Partial<TableMessages>>({});
  readonly trackBy = input<(row: T, index: number) => unknown>((_row, index) => index);
  readonly selectionMode = input<TableSelectionMode>('none');
  readonly selectedRows = input<readonly T[]>([]);
  readonly rowKey = input<(row: T) => unknown>((row) => row);

  readonly queryChange = output<TableQuery>();
  readonly actionTriggered = output<TableActionEvent<T>>();
  readonly add = output<void>();
  readonly retry = output<void>();
  readonly selectionChange = output<readonly T[]>();

  protected readonly filterValue = linkedSignal(() => this.filter());
  protected readonly selection = linkedSignal<readonly T[]>(() => this.selectedRows());
  protected readonly resolvedMessages = computed<TableMessages>(() => ({
    ...DEFAULT_TABLE_MESSAGES,
    ...this.messages(),
  }));
  protected readonly displayedColumns = computed(() => [
    ...(this.selectionMode() === 'none' ? [] : ['__select']),
    ...this.columns().map((column) => String(column.field)),
    ...(this.actions().length > 0 ? ['__actions'] : []),
  ]);
  protected readonly isEmpty = computed(
    () => !this.loading() && !this.error() && this.data().length === 0,
  );
  protected readonly effectiveTotal = computed(() => this.totalRecords() || this.data().length);
  protected readonly recordCountLabel = computed(() => {
    const count = this.effectiveTotal();
    const label =
      count === 1 ? this.resolvedMessages().recordSingular : this.resolvedMessages().recordPlural;
    return `${count} ${label}`;
  });
  protected readonly cellTemplates =
    contentChildren<CellTemplateDirective<T>>(CellTemplateDirective);

  private filterTimer: ReturnType<typeof setTimeout> | undefined;

  ngOnDestroy(): void {
    if (this.filterTimer) {
      clearTimeout(this.filterTimer);
    }
  }

  protected handleFilter(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.filterValue.set(value);

    if (this.filterTimer) {
      clearTimeout(this.filterTimer);
    }

    this.filterTimer = setTimeout(() => {
      this.emitQuery({ pageIndex: 0, filter: value.trim() });
    }, this.filterDebounce());
  }

  protected clearFilter(): void {
    if (this.filterTimer) {
      clearTimeout(this.filterTimer);
    }

    this.filterValue.set('');
    this.emitQuery({ pageIndex: 0, filter: '' });
  }

  protected handlePage(event: PageEvent): void {
    this.emitQuery({ pageIndex: event.pageIndex, pageSize: event.pageSize });
  }

  protected handleSort(event: Sort): void {
    const sort = event.direction ? { active: event.active, direction: event.direction } : null;

    this.emitQuery({ pageIndex: 0, sort });
  }

  protected triggerAction(action: TableAction<T>, row: T): void {
    this.actionTriggered.emit({ action, row });
  }

  protected isSelected(row: T): boolean {
    const key = this.rowKey()(row);
    return this.selection().some((selected) => Object.is(this.rowKey()(selected), key));
  }

  protected toggleRow(row: T): void {
    const selected = this.isSelected(row);
    const key = this.rowKey()(row);
    let next: readonly T[];

    if (selected) {
      next = this.selection().filter((item) => !Object.is(this.rowKey()(item), key));
    } else if (this.selectionMode() === 'single') {
      next = [row];
    } else {
      next = [...this.selection(), row];
    }

    this.selection.set(next);
    this.selectionChange.emit(next);
  }

  protected allVisibleRowsSelected(): boolean {
    return this.data().length > 0 && this.data().every((row) => this.isSelected(row));
  }

  protected someVisibleRowsSelected(): boolean {
    return !this.allVisibleRowsSelected() && this.data().some((row) => this.isSelected(row));
  }

  protected toggleAllVisibleRows(): void {
    const pageKeys = new Set(this.data().map((row) => this.rowKey()(row)));
    const next = this.allVisibleRowsSelected()
      ? this.selection().filter((row) => !pageKeys.has(this.rowKey()(row)))
      : [...this.selection(), ...this.data().filter((row) => !this.isSelected(row))];

    this.selection.set(next);
    this.selectionChange.emit(next);
  }

  protected rowSelectionLabel(row: T): string {
    return `${this.resolvedMessages().selectRowLabel} ${String(this.rowKey()(row))}`;
  }

  protected visibleActions(row: T): readonly TableAction<T>[] {
    return this.actions().filter((action) => !action.hidden?.(row));
  }

  protected isActionDisabled(action: TableAction<T>, row: T): boolean {
    return action.disabled?.(row) ?? false;
  }

  protected valueFor(row: T, column: TableColumn<T>): unknown {
    return column.valueAccessor ? column.valueAccessor(row) : getNestedValue(row, column.field);
  }

  protected dateValueFor(row: T, column: TableColumn<T>): string | number | Date | null {
    const value = this.valueFor(row, column);
    return typeof value === 'string' || typeof value === 'number' || value instanceof Date
      ? value
      : null;
  }

  protected currencyValueFor(row: T, column: TableColumn<T>): string | number | null {
    const value = this.valueFor(row, column);
    return typeof value === 'string' || typeof value === 'number' ? value : null;
  }

  protected hasValue(row: T, column: TableColumn<T>): boolean {
    const value = this.valueFor(row, column);
    return value !== null && value !== undefined && value !== '';
  }

  protected emptyValueFor(column: TableColumn<T>): string {
    return column.emptyValue ?? '—';
  }

  protected textFor(row: T, column: TableColumn<T>): string {
    const value = this.valueFor(row, column);

    if (column.formatter) {
      return column.formatter(value, row);
    }

    if (value === null || value === undefined || value === '') {
      return column.emptyValue ?? '—';
    }

    return String(value);
  }

  protected booleanLabel(row: T, column: TableColumn<T>): string {
    return Boolean(this.valueFor(row, column))
      ? (column.trueLabel ?? 'Yes')
      : (column.falseLabel ?? 'No');
  }

  protected badgeFor(row: T, column: TableColumn<T>): TableBadge {
    const value = this.valueFor(row, column);
    const key = String(value ?? '');
    return column.badges?.[key] ?? { label: key || (column.emptyValue ?? '—'), tone: 'neutral' };
  }

  protected templateFor(column: TableColumn<T>): TemplateRef<TableCellContext<T>> | null {
    return (
      this.cellTemplates().find((template) => template.columnKey() === String(column.field))
        ?.template ?? null
    );
  }

  protected templateContext(row: T, column: TableColumn<T>): TableCellContext<T> {
    return {
      $implicit: row,
      row,
      value: this.valueFor(row, column),
      column,
    };
  }

  protected readonly trackRows = (index: number, row: T): unknown => this.trackBy()(row, index);

  private emitQuery(changes: Partial<TableQuery>): void {
    this.queryChange.emit({
      pageIndex: changes.pageIndex ?? this.pageIndex(),
      pageSize: changes.pageSize ?? this.pageSize(),
      filter: changes.filter ?? this.filterValue().trim(),
      sort: changes.sort === undefined ? this.sort() : changes.sort,
    });
  }
}
