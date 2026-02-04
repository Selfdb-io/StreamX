---
name: selfdb-js-sdk
description: Use the SelfDB JavaScript/TypeScript SDK (@selfdb/js-sdk) to implement backend requirements with SelfDB BaaS. Provides Auth (with built-in users table), Tables (custom data with CRUD), Storage (buckets/files), and Realtime (WebSocket subscriptions). DO NOT create a users table - SelfDB manages users internally via selfdb.auth.users.
---

# SelfDB JS SDK

Build the backend layer using **SelfDB** as the BaaS: **Auth + Tables + Storage + Realtime**.

## CRITICAL: SelfDB Has a Built-in Users Table

**DO NOT create a `users` table.** SelfDB manages users internally through `selfdb.auth.users`. The built-in user has:

```typescript
interface UserRead {
  id: string;           // UUID - use this as user_id in your tables
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}
```

For extended user data (bio, avatar, preferences), create a `user_profiles` table with `user_id UUID PRIMARY KEY` that references the SelfDB user.

## SDK Structure Overview

```typescript
import { SelfDB } from '@selfdb/js-sdk';

const selfdb = new SelfDB({
  baseUrl: string,   // Required: API base URL
  apiKey: string,    // Required: API key
  timeout?: number   // Optional: request timeout in ms
});

// Four main modules:
selfdb.auth      // Authentication + User management (BUILT-IN USERS TABLE)
selfdb.tables    // Table CRUD + Column operations + Data operations
selfdb.storage   // Bucket CRUD + File operations
selfdb.realtime  // Phoenix Channels WebSocket for live updates
```

## Module 1: Auth (selfdb.auth)

### Authentication Methods

```typescript
// Login - returns tokens
const tokens = await selfdb.auth.login({ email: string, password: string });
// Returns: { access_token: string, refresh_token: string, token_type: string }

// Get current logged-in user
const user = await selfdb.auth.me();
// Returns: UserRead

// Refresh access token
const newTokens = await selfdb.auth.refresh({ refreshToken: string });
// Returns: TokenPair

// Logout (revoke current refresh token)
await selfdb.auth.logout({ refreshToken?: string });
// Returns: { message: string }

// Logout from all devices
await selfdb.auth.logoutAll();
// Returns: { message: string }

// Count users
const { count } = await selfdb.auth.count({ search?: string });
```

### User Management (selfdb.auth.users)

**This is the built-in users table. DO NOT create your own users table.**

```typescript
// Create a new user
const user = await selfdb.auth.users.create({
  email: string,       // Required
  password: string,    // Required
  firstName: string,   // Required (camelCase!)
  lastName: string,    // Required (camelCase!)
  role?: 'USER' | 'ADMIN'  // Optional, defaults to 'USER'
});
// Returns: UserRead

// List users with pagination
const users = await selfdb.auth.users.list({
  skip?: number,
  limit?: number,
  search?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
});
// Returns: UserRead[]

// Get user by ID
const user = await selfdb.auth.users.get(userId: string);
// Returns: UserRead

// Update user
const updated = await selfdb.auth.users.update(userId: string, {
  firstName?: string,
  lastName?: string,
  password?: string,
  role?: 'USER' | 'ADMIN'
});
// Returns: UserRead

// Delete user
await selfdb.auth.users.delete(userId: string);
// Returns: { message: string, user_id: string }
```

## Module 2: Tables (selfdb.tables)

### CRITICAL: Table ID vs Table Name

**All data operations require a `tableId`, NOT a table name.** Use this helper pattern:

```typescript
const tableIdCache: Record<string, string> = {};

async function getTableId(tableName: string): Promise<string> {
  if (tableIdCache[tableName]) return tableIdCache[tableName];
  const tables = await selfdb.tables.list({ search: tableName, limit: 100 });
  const table = tables.find((t) => t.name === tableName);
  if (!table) throw new Error(`Table "${tableName}" not found`);
  tableIdCache[tableName] = table.id;
  return table.id;
}
```

### Table Lifecycle

```typescript
// Create table
const table = await selfdb.tables.create({
  name: string,
  table_schema: TableSchema,  // See column types below
  public: boolean
});
// Returns: TableRead

// List tables
const tables = await selfdb.tables.list({
  skip?: number,
  limit?: number,
  search?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
});
// Returns: TableRead[]

// Get table by ID
const table = await selfdb.tables.get(tableId: string);
// Returns: TableRead

// Update table
const updated = await selfdb.tables.update(tableId: string, {
  name?: string,
  public?: boolean,
  realtime_enabled?: boolean  // Enable/disable realtime events
});
// Returns: TableRead

// Delete table
await selfdb.tables.delete(tableId: string);
// Returns: { message: string, table_id: string }

// Count tables
const { count } = await selfdb.tables.count({ search?: string });
```

### Column Types (table_schema)

```typescript
type ColumnType = 'text' | 'varchar' | 'integer' | 'bigint' | 'boolean' | 'timestamp' | 'jsonb' | 'uuid';

interface ColumnSchema {
  type: ColumnType;      // Required
  nullable?: boolean;    // Optional, defaults to true
  default?: unknown;     // Optional default value
}

// Example table_schema:
const schema = {
  id: { type: 'uuid', nullable: false },
  user_id: { type: 'uuid', nullable: false },
  title: { type: 'text', nullable: false },
  content: { type: 'text', nullable: true },
  views: { type: 'integer', nullable: true, default: 0 },
  published: { type: 'boolean', nullable: true, default: false },
  metadata: { type: 'jsonb', nullable: true },
  created_at: { type: 'timestamp', nullable: true },
  updated_at: { type: 'timestamp', nullable: true }
};
```

### Column Operations (selfdb.tables.columns)

```typescript
// Add column
const table = await selfdb.tables.columns.add(tableId: string, {
  name: string,
  type: ColumnType,
  nullable?: boolean,
  default_value?: unknown
});
// Returns: TableRead

// Update column
const table = await selfdb.tables.columns.update(
  tableId: string,
  columnName: string,
  {
    new_name?: string,
    type?: ColumnType,
    nullable?: boolean,
    default_value?: unknown
  }
);
// Returns: TableRead

// Remove column
const table = await selfdb.tables.columns.remove(tableId: string, columnName: string);
// Returns: TableRead
```

### Data Operations (selfdb.tables.data)

```typescript
// Insert row
const row = await selfdb.tables.data.insert(tableId: string, row: Record<string, unknown>);
// Returns: Record<string, unknown> (the inserted row)

// Update row
const updated = await selfdb.tables.data.updateRow(
  tableId: string,
  rowId: string,
  updates: Record<string, unknown>,
  options?: { idColumn?: string }  // Default: 'id'
);
// Returns: Record<string, unknown>

// Delete row
await selfdb.tables.data.deleteRow(
  tableId: string,
  rowId: string,
  options?: { idColumn?: string }
);
// Returns: { message: string, row_id: string }

// Fetch with options (alternative to query builder)
const result = await selfdb.tables.data.fetch(tableId: string, {
  page?: number,
  pageSize?: number,
  search?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
});
// Returns: TableDataResponse
```

### Query Builder (selfdb.tables.data.query)

```typescript
const result = await selfdb.tables.data
  .query(tableId)
  .search('term')              // Text search
  .sort('column', 'desc')      // Sort by column
  .page(1)                     // Page number (1-indexed)
  .pageSize(25)                // Results per page (1-1000)
  .execute();

// Returns:
interface TableDataResponse {
  data: Record<string, unknown>[];
  total: number;
  page: number;
  pageSize: number;
}
```

## Module 3: Storage (selfdb.storage)

### CRITICAL: Bucket ID vs Bucket Name

- `files.upload()` requires **bucketId**
- `files.download()` requires **bucketName** + **path**

```typescript
const bucketIdCache: Record<string, string> = {};

async function getBucketId(bucketName: string): Promise<string> {
  if (bucketIdCache[bucketName]) return bucketIdCache[bucketName];
  const buckets = await selfdb.storage.buckets.list({ search: bucketName, limit: 100 });
  const bucket = buckets.find((b) => b.name === bucketName);
  if (!bucket) throw new Error(`Bucket "${bucketName}" not found`);
  bucketIdCache[bucketName] = bucket.id;
  return bucket.id;
}
```

### Bucket Operations (selfdb.storage.buckets)

```typescript
// Create bucket
const bucket = await selfdb.storage.buckets.create({
  name: string,
  public: boolean
});
// Returns: BucketResponse

// List buckets
const buckets = await selfdb.storage.buckets.list({
  skip?: number,
  limit?: number,
  search?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
});
// Returns: BucketResponse[]

// Get bucket by ID
const bucket = await selfdb.storage.buckets.get(bucketId: string);
// Returns: BucketResponse

// Update bucket
const updated = await selfdb.storage.buckets.update(bucketId: string, {
  name?: string,
  public?: boolean
});
// Returns: BucketResponse

// Delete bucket
await selfdb.storage.buckets.delete(bucketId: string);
// Returns: void

// Count buckets
const { count } = await selfdb.storage.buckets.count({ search?: string });
```

### File Operations (selfdb.storage.files)

```typescript
// Upload file (uses bucketId)
const upload = await selfdb.storage.files.upload(bucketId: string, {
  filename: string,
  data: ArrayBuffer | Uint8Array | Blob | string,
  path?: string,
  contentType?: string
});
// Returns: { success: boolean, bucket: string, path: string, size: number, file_id: string }

// Download file (uses bucketName + path, NOT bucketId!)
const arrayBuffer = await selfdb.storage.files.download({
  bucketName: string,
  path: string
});
// Returns: ArrayBuffer

// List files
const result = await selfdb.storage.files.list({
  bucketId?: string,
  skip?: number,
  limit?: number,
  pageSize?: number,
  search?: string
});
// Returns: { data: FileResponse[], total: number, page: number, pageSize: number }

// Get file by ID
const file = await selfdb.storage.files.get(fileId: string);
// Returns: FileResponse

// Update file metadata
const updated = await selfdb.storage.files.updateMetadata(
  fileId: string,
  metadata: Record<string, unknown>
);
// Returns: FileResponse

// Delete file
await selfdb.storage.files.delete(fileId: string);
// Returns: void

// Storage statistics
const stats = await selfdb.storage.files.stats();
// Returns: { total_files: number, total_size: number, buckets_count: number }

// Count files
const { count } = await selfdb.storage.files.count({ bucketId?: string, search?: string });
const { count } = await selfdb.storage.files.totalCount({ search?: string });
```

## Module 4: Realtime (selfdb.realtime)

Phoenix Channels WebSocket for live table updates.

### Connection

```typescript
// Connect (must be logged in first to set access token)
await selfdb.realtime.connect();

// Get connection state
const state = selfdb.realtime.getState();
// Returns: 'disconnected' | 'connecting' | 'connected' | 'disconnecting'

// Disconnect
await selfdb.realtime.disconnect();
```

### Channel Subscription

```typescript
// Channel topic format: 'table:{tableName}' (use table NAME, not ID)
const channel = selfdb.realtime.channel(`table:${tableName}`);

// Register event handlers (chainable)
channel
  .on('INSERT', (payload) => console.log('New row:', payload.new))
  .on('UPDATE', (payload) => console.log('Updated:', payload.new, 'was:', payload.old))
  .on('DELETE', (payload) => console.log('Deleted:', payload.old))
  .on('*', (payload) => console.log('Any event:', payload));

// Subscribe to start receiving events
await channel.subscribe();

// Get channel state
const state = channel.getState();
// Returns: 'closed' | 'joining' | 'joined' | 'leaving'

// Unsubscribe
await channel.unsubscribe();

// Remove specific handler
channel.off('INSERT', handlerFunction);
channel.off('INSERT'); // Remove all INSERT handlers
```

### Realtime Payload

```typescript
interface RealtimePayload {
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  new: Record<string, unknown> | null;  // New row data (null for DELETE)
  old: Record<string, unknown> | null;  // Old row data (null for INSERT)
  raw: unknown;
}
```

### Enable Realtime for a Table

If events aren't arriving, ensure `realtime_enabled` is true:

```typescript
const table = await selfdb.tables.get(tableId);
if (!table.realtime_enabled) {
  await selfdb.tables.update(tableId, { realtime_enabled: true });
}
```

## Error Handling

```typescript
import {
  SelfDBError,           // Base class for all errors
  APIConnectionError,    // Network/timeout failures
  BadRequestError,       // 400/422 - Invalid request
  AuthenticationError,   // 401 - Login required
  PermissionDeniedError, // 403 - Not allowed
  NotFoundError,         // 404 - Resource not found
  ConflictError,         // 409 - Resource conflict
  InternalServerError    // 5xx - Server error
} from '@selfdb/js-sdk';

try {
  await selfdb.tables.get('missing-id');
} catch (error) {
  if (error instanceof NotFoundError) {
    console.log('Table not found');
  } else if (error instanceof AuthenticationError) {
    console.log('Please login first');
  } else if (error instanceof PermissionDeniedError) {
    console.log('Access denied');
  } else if (error instanceof SelfDBError) {
    console.log(`SelfDB error: ${error.message}, status: ${error.status}`);
  }
}
```

## Access Model

1. **Admin provisions resources**: Tables and buckets are created by admin (dashboard or via admin credentials)
2. **CORS required for browsers**: Add your app origin to Allowed Origins in the dashboard
3. **Public vs Private**:
   - Public resources: API key + CORS
   - Private resources: API key + CORS + user login (tokens)
4. **RLS/Permissions**: Configured in the dashboard, not via SDK

## Non-Negotiables

1. **DO NOT create a users table** - use `selfdb.auth.users`
2. **Use `user_id` columns** for owned tables (references SelfDB user.id)
3. **SQL output must have NO comments** (no `--` or `/* */`)
4. **Use `getTableId()` helper** before any `selfdb.tables.data.*` call
5. **Use `getBucketId()` helper** before any `selfdb.storage.files.upload()` call
6. **Login before realtime** - `selfdb.realtime.connect()` requires access token

## Reference Documentation

- [references/api-cheatsheet.md](references/api-cheatsheet.md) - Complete API reference
- [references/examples.md](references/examples.md) - Working code examples
- [references/schema-patterns.sql](references/schema-patterns.sql) - SQL DDL patterns
