import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { TableAction } from '../../core/table-action';
import { TableColumn } from '../../core/table-column';
import { ConfigurableTable } from './configurable-table';

interface Person {
  readonly id: number;
  readonly name: string;
  readonly active: boolean;
  readonly company: {
    readonly name: string;
  };
}

const people: readonly Person[] = [
  { id: 1, name: 'Ada Lovelace', active: true, company: { name: 'Analytical Engines' } },
  { id: 2, name: 'Grace Hopper', active: false, company: { name: 'US Navy' } },
];

const columns: readonly TableColumn<Person>[] = [
  { field: 'name', header: 'Name', sortable: true },
  { field: 'company.name', header: 'Company' },
  { field: 'active', header: 'Active', type: 'boolean' },
];

describe('ConfigurableTable', () => {
  async function createTable() {
    await TestBed.configureTestingModule({ imports: [ConfigurableTable] }).compileComponents();
    const fixture = TestBed.createComponent(ConfigurableTable<Person>);
    fixture.componentRef.setInput('data', people);
    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('totalRecords', people.length);
    fixture.componentRef.setInput('showPaginator', false);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  it('renders configured and nested values', async () => {
    const fixture = await createTable();
    const text = fixture.nativeElement.textContent as string;

    expect(text).toContain('Ada Lovelace');
    expect(text).toContain('Analytical Engines');
    expect(text).toContain('Yes');
    expect(text).toContain('No');
  });

  it('emits a typed action with its row', async () => {
    const fixture = await createTable();
    const action: TableAction<Person> = { id: 'edit', label: 'Edit person', icon: 'edit' };
    const listener = vi.fn();
    fixture.componentRef.setInput('actions', [action]);
    fixture.componentInstance.actionTriggered.subscribe(listener);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      'button[aria-label="Edit person"]',
    ) as HTMLButtonElement;
    button.click();

    expect(listener).toHaveBeenCalledWith({ action, row: people[0] });
  });

  it('emits a server-side sort query', async () => {
    const fixture = await createTable();
    const listener = vi.fn();
    fixture.componentInstance.queryChange.subscribe(listener);

    const sortHeader = fixture.nativeElement.querySelector(
      '.mat-sort-header-container',
    ) as HTMLElement;
    sortHeader.click();
    fixture.detectChanges();

    expect(listener).toHaveBeenCalledWith({
      pageIndex: 0,
      pageSize: 10,
      filter: '',
      sort: { active: 'name', direction: 'asc' },
    });
  });

  it('supports typed multiple row selection', async () => {
    const fixture = await createTable();
    const listener = vi.fn();
    fixture.componentRef.setInput('selectionMode', 'multiple');
    fixture.componentRef.setInput('rowKey', (person: Person) => person.id);
    fixture.componentInstance.selectionChange.subscribe(listener);
    fixture.detectChanges();

    const checkboxes = fixture.nativeElement.querySelectorAll(
      '.cdt-selection-cell input[type="checkbox"]',
    ) as NodeListOf<HTMLInputElement>;
    const checkbox = checkboxes[1];
    checkbox.click();
    fixture.detectChanges();

    expect(listener).toHaveBeenCalledWith([people[0]]);
  });

  it('debounces and emits a filter query', async () => {
    const fixture = await createTable();
    const listener = vi.fn();
    fixture.componentRef.setInput('filterDebounce', 0);
    fixture.componentInstance.queryChange.subscribe(listener);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input[type="search"]') as HTMLInputElement;
    input.value = 'ada';
    input.dispatchEvent(new Event('input'));
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(listener).toHaveBeenCalledWith({
      pageIndex: 0,
      pageSize: 10,
      filter: 'ada',
      sort: null,
    });
  });

  it('shows the empty and error states', async () => {
    const fixture = await createTable();
    fixture.componentRef.setInput('data', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No records found');

    fixture.componentRef.setInput('error', 'The server is unavailable.');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('The server is unavailable.');
  });
});
