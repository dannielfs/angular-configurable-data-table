import { Component, computed, signal } from '@angular/core';
import {
  CellTemplateDirective,
  ConfigurableTable,
  defineTableCell,
  getNestedValue,
  TableAction,
  TableActionEvent,
  TableColumn,
  TableQuery,
} from 'configurable-data-table';
import { Developer } from './demo-data/developer';
import { DEVELOPERS } from './demo-data/developers';

@Component({
  imports: [CellTemplateDirective, ConfigurableTable],
  selector: 'demo-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly developerNameCell = defineTableCell<Developer>('name');

  protected readonly query = signal<TableQuery>({
    pageIndex: 0,
    pageSize: 5,
    filter: '',
    sort: { active: 'name', direction: 'asc' },
  });

  protected readonly lastEvent = signal('Interact with the table to see emitted events.');

  protected readonly columns = [
    { field: 'name', header: 'Developer', sortable: true, width: '17rem' },
    { field: 'company.name', header: 'Company', sortable: true },
    { field: 'location', header: 'Location', sortable: true, hideOnMobile: true },
    {
      field: 'hourlyRate',
      header: 'Rate',
      type: 'currency',
      currencyCode: 'USD',
      sortable: true,
      align: 'end',
    },
    {
      field: 'remote',
      header: 'Remote',
      type: 'boolean',
      trueLabel: 'Yes',
      falseLabel: 'No',
      align: 'center',
    },
    {
      field: 'status',
      header: 'Status',
      type: 'badge',
      badges: {
        available: { label: 'Available', tone: 'success' },
        interviewing: { label: 'Interviewing', tone: 'info' },
        unavailable: { label: 'Unavailable', tone: 'neutral' },
      },
    },
    {
      field: 'joinedAt',
      header: 'Joined',
      type: 'date',
      dateFormat: 'MMM d, y',
      sortable: true,
      hideOnMobile: true,
    },
  ] as const satisfies readonly TableColumn<Developer>[];

  protected readonly actions = [
    { id: 'view', label: 'View developer', icon: 'visibility', tone: 'primary' },
    { id: 'edit', label: 'Edit developer', icon: 'edit' },
    {
      id: 'delete',
      label: 'Delete developer',
      icon: 'delete',
      tone: 'danger',
      disabled: (developer) => developer.status === 'interviewing',
    },
  ] as const satisfies readonly TableAction<Developer>[];

  private readonly matchingRows = computed(() => {
    const query = this.query();
    const filter = query.filter.toLocaleLowerCase();
    const filtered = DEVELOPERS.filter((developer) =>
      [
        developer.name,
        developer.email,
        developer.role,
        developer.company.name,
        developer.location,
        developer.status,
      ].some((value) => value.toLocaleLowerCase().includes(filter)),
    );

    if (!query.sort) {
      return filtered;
    }

    const column = this.columns.find((item) => item.field === query.sort?.active);

    if (!column) {
      return filtered;
    }

    return [...filtered].sort((left, right) => {
      const leftValue = getNestedValue(left, column.field);
      const rightValue = getNestedValue(right, column.field);
      const comparison = this.compare(leftValue, rightValue);
      return query.sort?.direction === 'asc' ? comparison : -comparison;
    });
  });

  protected readonly totalRecords = computed(() => this.matchingRows().length);

  protected readonly visibleRows = computed(() => {
    const { pageIndex, pageSize } = this.query();
    const start = pageIndex * pageSize;
    return this.matchingRows().slice(start, start + pageSize);
  });

  protected readonly developerRowKey = (developer: Developer): number => developer.id;

  protected handleQuery(query: TableQuery): void {
    this.query.set(query);
    this.lastEvent.set(`queryChange → ${JSON.stringify(query)}`);
  }

  protected handleAction(event: TableActionEvent<Developer>): void {
    this.lastEvent.set(`actionTriggered → ${event.action.id} · ${event.row.name}`);
  }

  protected handleAdd(): void {
    this.lastEvent.set('add → create a new developer');
  }

  protected handleSelection(rows: readonly Developer[]): void {
    this.lastEvent.set(`selectionChange → ${rows.map((row) => row.name).join(', ') || 'none'}`);
  }

  protected initials(name: string): string {
    return name
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0])
      .join('');
  }

  private compare(left: unknown, right: unknown): number {
    if (typeof left === 'number' && typeof right === 'number') {
      return left - right;
    }

    return String(left ?? '').localeCompare(String(right ?? ''), 'en', {
      numeric: true,
      sensitivity: 'base',
    });
  }
}
