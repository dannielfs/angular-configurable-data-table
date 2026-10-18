# configurable-data-table

A strongly typed, configurable Angular Material table for server-driven applications.

## Installation

```bash
npm install configurable-data-table @angular/material @angular/cdk
```

Configure an Angular Material theme in the consuming application, then import the standalone component:

```ts
import { ConfigurableTable, TableColumn } from 'configurable-data-table';

interface User {
  readonly name: string;
  readonly email: string;
}

const columns = [
  { field: 'name', header: 'Name', sortable: true },
  { field: 'email', header: 'Email' },
] as const satisfies readonly TableColumn<User>[];

@Component({
  imports: [ConfigurableTable],
  template: `<cdt-table [data]="users()" [columns]="columns" />`,
})
export class UsersPage {}
```

See the repository README and demo application for custom cells, row actions, server-side queries, state handling, localization, and responsive behavior.
