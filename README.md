# Angular Configurable Data Table

A reusable and strongly typed Angular data table built with Angular Material. It turns typed column definitions into an accessible, responsive table while keeping filtering, sorting, pagination, and data fetching under application control.

## Features

- Strongly typed columns and row actions
- Direct and nested fields such as `company.name`
- Text, number, date, currency, boolean, and badge renderers
- Custom cell templates through `cdtCell`
- Server-side filtering, sorting, and pagination contract
- Configurable and conditional row actions
- Single and multiple row selection
- Loading, empty, and error states
- Responsive mobile card layout
- Customizable labels and locale
- Angular Signals and zoneless demo application
- Vitest test suite

## Workspace structure

```text
projects/configurable-data-table/  # publishable library
src/app/                           # interactive demo application
```

The `core` directory contains framework-light contracts and utilities. The `material` directory contains the Angular Material renderer.

## Quick start

```ts
import { TableAction, TableColumn, TableQuery } from 'configurable-data-table';

interface User {
  readonly id: number;
  readonly name: string;
  readonly company: { readonly name: string };
  readonly active: boolean;
}

const columns = [
  { field: 'name', header: 'Name', sortable: true },
  { field: 'company.name', header: 'Company' },
  { field: 'active', header: 'Active', type: 'boolean' },
] as const satisfies readonly TableColumn<User>[];

const actions = [
  { id: 'edit', label: 'Edit user', icon: 'edit' },
] as const satisfies readonly TableAction<User>[];
```

Import the component and optional custom-cell directive:

```ts
import { CellTemplateDirective, ConfigurableTable, defineTableCell } from 'configurable-data-table';

@Component({
  imports: [CellTemplateDirective, ConfigurableTable],
  templateUrl: './users.html',
})
export class UsersPage {
  readonly nameCell = defineTableCell<User>('name');
  readonly userRowKey = (user: User) => user.id;
}
```

```html
<cdt-table
  [data]="users()"
  [columns]="columns"
  [actions]="actions"
  [totalRecords]="totalRecords()"
  [rowKey]="userRowKey"
  selectionMode="multiple"
  (queryChange)="loadUsers($event)"
  (actionTriggered)="handleAction($event)"
  (selectionChange)="selectedUsers.set($event)"
>
  <ng-template [cdtCell]="nameCell" let-user="$implicit">
    <strong>{{ user.name }}</strong>
  </ng-template>
</cdt-table>
```

`queryChange` emits a stable server-side contract:

```ts
interface TableQuery {
  pageIndex: number;
  pageSize: number;
  filter: string;
  sort: { active: string; direction: 'asc' | 'desc' } | null;
}
```

## Development

```bash
npm install
npm start
```

The demo is available at `http://localhost:4200`.

## Validation

```bash
npm run format:check
npm test
npm run build
```

## Build the library

```bash
npm run build:library
```

The package is generated in `dist/configurable-data-table`.

## Roadmap

- Expandable rows
- Column visibility controls
- Multi-column sorting
- Virtual scrolling
- Persisted table preferences

## License

MIT
