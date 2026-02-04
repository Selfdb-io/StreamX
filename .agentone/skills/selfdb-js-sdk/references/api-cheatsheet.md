# SelfDB JS SDK — Complete API Reference

## Client Initialization

```typescript
import { SelfDB } from '@selfdb/js-sdk';

const selfdb = new SelfDB({
  baseUrl: string,   // Required: API base URL (e.g., 'https://api.selfdb.io')
  apiKey: string,    // Required: API key from dashboard
  timeout?: number   // Optional: request timeout in milliseconds
});
```

---

## selfdb.auth — Authentication Module

### Authentication Flow

| Method | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| `login` | `({ email: string, password: string })` | `TokenPair` | Login and get tokens |
| `me` | `()` | `UserRead` | Get current logged-in user |
| `refresh` | `({ refreshToken: string })` | `TokenPair` | Refresh access token |
| `logout` | `({ refreshToken?: string })` | `LogoutResponse` | Revoke refresh token |
| `logoutAll` | `()` | `LogoutResponse` | Logout from all devices |
| `count` | `({ search?: string })` | `CountResponse` | Count users |

### Response Types

```typescript
interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

interface UserRead {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

interface LogoutResponse {
  message: string;
}

interface CountResponse {
  count: number;
}
```

---

## selfdb.auth.users — Built-in User Management

**IMPORTANT: SelfDB has a built-in users table. DO NOT create your own.**

| Method | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| `create` | `(UserCreate)` | `UserRead` | Create new user |
| `list` | `(PaginationOptions?)` | `UserRead[]` | List all users |
| `get` | `(userId: string)` | `UserRead` | Get user by ID |
| `update` | `(userId: string, UserUpdate)` | `UserRead` | Update user |
| `delete` | `(userId: string)` | `UserDeleteResponse` | Delete user |

### Request Types

```typescript
interface UserCreate {
  email: string;       // Required
  password: string;    // Required
  firstName: string;   // Required (camelCase!)
  lastName: string;    // Required (camelCase!)
  role?: 'USER' | 'ADMIN';
}

interface UserUpdate {
  firstName?: string;
  lastName?: string;
  password?: string;
  role?: 'USER' | 'ADMIN';
}

interface PaginationOptions {
  skip?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface UserDeleteResponse {
  message: string;
  user_id: string;
}
```

---

## selfdb.tables — Table Management

### Table Lifecycle

| Method | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| `create` | `(TableCreate)` | `TableRead` | Create table |
| `list` | `(PaginationOptions?)` | `TableRead[]` | List tables |
| `get` | `(tableId: string)` | `TableRead` | Get table by ID |
| `update` | `(tableId: string, TableUpdate)` | `TableRead` | Update table |
| `delete` | `(tableId: string)` | `TableDeleteResponse` | Delete table |
| `count` | `({ search?: string })` | `CountResponse` | Count tables |

### Types

```typescript
type ColumnType = 'text' | 'varchar' | 'integer' | 'bigint' | 'boolean' | 'timestamp' | 'jsonb' | 'uuid';

interface ColumnSchema {
  type: ColumnType;
  nullable?: boolean;  // default: true
  default?: unknown;
}

interface TableSchema {
  [columnName: string]: ColumnSchema;
}

interface TableCreate {
  name: string;
  table_schema: TableSchema;
  public: boolean;
}

interface TableUpdate {
  name?: string;
  public?: boolean;
  realtime_enabled?: boolean;
}

interface TableRead {
  id: string;
  name: string;
  table_schema: TableSchema;
  public: boolean;
  realtime_enabled: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

interface TableDeleteResponse {
  message: string;
  table_id: string;
}
```

---

## selfdb.tables.columns — Column Operations

| Method | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| `add` | `(tableId, ColumnDefinition)` | `TableRead` | Add column |
| `update` | `(tableId, columnName, ColumnUpdate)` | `TableRead` | Update column |
| `remove` | `(tableId, columnName)` | `TableRead` | Remove column |

### Types

```typescript
interface ColumnDefinition {
  name: string;
  type: ColumnType;
  nullable?: boolean;
  default_value?: unknown;
}

interface ColumnUpdate {
  new_name?: string;
  type?: ColumnType;
  nullable?: boolean;
  default_value?: unknown;
}
```

---

## selfdb.tables.data — Data Operations

**CRITICAL: All methods require `tableId` (UUID), NOT table name!**

| Method | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| `query` | `(tableId)` | `TableQueryBuilder` | Create query builder |
| `fetch` | `(tableId, options?)` | `TableDataResponse` | Fetch with options |
| `insert` | `(tableId, row)` | `Record<string, unknown>` | Insert row |
| `updateRow` | `(tableId, rowId, updates, options?)` | `Record<string, unknown>` | Update row |
| `deleteRow` | `(tableId, rowId, options?)` | `RowDeleteResponse` | Delete row |

### Query Builder

```typescript
const result = await selfdb.tables.data
  .query(tableId)
  .search(term: string)              // Text search filter
  .sort(column: string, order?: 'asc' | 'desc')  // Sort results
  .page(pageNumber: number)          // Page number (1-indexed)
  .pageSize(size: number)            // Results per page (1-1000)
  .execute();                        // Execute and return results
```

### Types

```typescript
interface TableDataResponse {
  data: Record<string, unknown>[];
  total: number;
  page: number;
  pageSize: number;
}

interface RowDeleteResponse {
  message: string;
  row_id: string;
}

// Options for updateRow/deleteRow
interface RowOptions {
  idColumn?: string;  // Default: 'id'
}
```

---

## selfdb.storage.buckets — Bucket Management

| Method | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| `create` | `(BucketCreate)` | `BucketResponse` | Create bucket |
| `list` | `(PaginationOptions?)` | `BucketResponse[]` | List buckets |
| `get` | `(bucketId: string)` | `BucketResponse` | Get bucket by ID |
| `update` | `(bucketId, BucketUpdate)` | `BucketResponse` | Update bucket |
| `delete` | `(bucketId: string)` | `void` | Delete bucket |
| `count` | `({ search?: string })` | `CountResponse` | Count buckets |

### Types

```typescript
interface BucketCreate {
  name: string;
  public: boolean;
}

interface BucketUpdate {
  name?: string;
  public?: boolean;
}

interface BucketResponse {
  id: string;
  name: string;
  public: boolean;
  owner_id: string;
  created_at: string;
  updated_at: string;
  file_count?: number;
  total_size?: number;
}
```

---

## selfdb.storage.files — File Operations

**CRITICAL: `upload` uses bucketId, `download` uses bucketName + path!**

| Method | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| `upload` | `(bucketId, UploadOptions)` | `FileUploadResponse` | Upload file |
| `download` | `({ bucketName, path })` | `ArrayBuffer` | Download file |
| `list` | `(ListOptions?)` | `FileDataResponse` | List files |
| `get` | `(fileId: string)` | `FileResponse` | Get file metadata |
| `updateMetadata` | `(fileId, metadata)` | `FileResponse` | Update metadata |
| `delete` | `(fileId: string)` | `void` | Delete file |
| `stats` | `()` | `StorageStatsResponse` | Get storage stats |
| `count` | `({ bucketId?, search? })` | `CountResponse` | Count files |
| `totalCount` | `({ search? })` | `CountResponse` | Total file count |

### Types

```typescript
// Upload options
interface UploadOptions {
  filename: string;
  data: ArrayBuffer | Uint8Array | Blob | string;
  path?: string;
  contentType?: string;
}

interface FileUploadResponse {
  success: boolean;
  bucket: string;
  path: string;
  size: number;
  file_id: string;
}

interface FileResponse {
  id: string;
  bucket_id: string;
  bucket_name: string;
  name: string;
  path: string;
  size: number;
  mime_type: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface FileDataResponse {
  data: FileResponse[];
  total: number;
  page: number;
  pageSize: number;
}

interface StorageStatsResponse {
  total_files: number;
  total_size: number;
  buckets_count: number;
}
```

---

## selfdb.realtime — WebSocket Realtime

### Connection Methods

| Method | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| `connect` | `()` | `Promise<void>` | Connect to WebSocket |
| `disconnect` | `()` | `Promise<void>` | Disconnect |
| `channel` | `(topic: string)` | `RealtimeChannel` | Get/create channel |
| `getState` | `()` | `ConnectionState` | Get connection state |

### Channel Methods

| Method | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| `on` | `(event, callback)` | `RealtimeChannel` | Register handler |
| `off` | `(event, callback?)` | `RealtimeChannel` | Remove handler |
| `subscribe` | `()` | `Promise<void>` | Start receiving events |
| `unsubscribe` | `()` | `Promise<void>` | Stop receiving events |
| `getState` | `()` | `ChannelState` | Get channel state |

### Types

```typescript
type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

interface RealtimePayload {
  event: RealtimeEvent;
  table: string;
  new: Record<string, unknown> | null;
  old: Record<string, unknown> | null;
  raw: unknown;
}

type RealtimeCallback = (payload: RealtimePayload) => void;

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'disconnecting';
type ChannelState = 'closed' | 'joining' | 'joined' | 'leaving';
```

### Usage Pattern

```typescript
// 1. Login first (sets access token)
await selfdb.auth.login({ email, password });

// 2. Enable realtime on table (if not enabled)
await selfdb.tables.update(tableId, { realtime_enabled: true });

// 3. Connect
await selfdb.realtime.connect();

// 4. Subscribe to channel (use table NAME, not ID)
const channel = selfdb.realtime.channel(`table:${tableName}`)
  .on('INSERT', (payload) => console.log('New:', payload.new))
  .on('UPDATE', (payload) => console.log('Updated:', payload.new))
  .on('DELETE', (payload) => console.log('Deleted:', payload.old))
  .on('*', (payload) => console.log('Any:', payload));

await channel.subscribe();

// 5. Later: cleanup
await channel.unsubscribe();
await selfdb.realtime.disconnect();
```

---

## Error Classes

```typescript
import {
  SelfDBError,           // Base class (has status, code, details)
  APIConnectionError,    // Network/timeout failures
  BadRequestError,       // 400/422 - Invalid request parameters
  AuthenticationError,   // 401 - Login required or invalid credentials
  PermissionDeniedError, // 403 - Insufficient permissions
  NotFoundError,         // 404 - Resource not found
  ConflictError,         // 409 - Resource conflict (e.g., duplicate)
  InternalServerError    // 5xx - Server error
} from '@selfdb/js-sdk';

// Base error properties
interface SelfDBError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
}
```

---

## Helper Patterns

### Table ID Cache

```typescript
const tableIdCache: Record<string, string> = {};

export async function getTableId(tableName: string): Promise<string> {
  if (tableIdCache[tableName]) return tableIdCache[tableName];
  const tables = await selfdb.tables.list({ search: tableName, limit: 100 });
  const table = tables.find((t) => t.name === tableName);
  if (!table) throw new Error(`Table "${tableName}" not found`);
  tableIdCache[tableName] = table.id;
  return table.id;
}

export async function loadTableIds(): Promise<void> {
  const tables = await selfdb.tables.list({ limit: 100 });
  for (const table of tables) tableIdCache[table.name] = table.id;
}
```

### Bucket ID Cache

```typescript
const bucketIdCache: Record<string, string> = {};

export async function getBucketId(bucketName: string): Promise<string> {
  if (bucketIdCache[bucketName]) return bucketIdCache[bucketName];
  const buckets = await selfdb.storage.buckets.list({ search: bucketName, limit: 100 });
  const bucket = buckets.find((b) => b.name === bucketName);
  if (!bucket) throw new Error(`Bucket "${bucketName}" not found`);
  bucketIdCache[bucketName] = bucket.id;
  return bucket.id;
}
```

### Token Management

```typescript
export function setAccessToken(token: string | null): void {
  // @ts-expect-error accessing SDK internals
  const client = selfdb.client || selfdb.auth?.client || selfdb.tables?.client;
  if (client?.setAccessToken) client.setAccessToken(token);
}

export function setRefreshToken(token: string | null): void {
  // @ts-expect-error accessing SDK internals
  const client = selfdb.client || selfdb.auth?.client || selfdb.tables?.client;
  if (client?.setRefreshToken) client.setRefreshToken(token);
}
```

### Extract Helpers

```typescript
export function extractData<T>(response: unknown): T {
  const resp = response as { data?: T } & T;
  return (resp.data ?? response) as T;
}

export function extractId(response: unknown): string {
  const resp = response as { data?: { id: string }; id?: string };
  const id = resp.data?.id ?? resp.id;
  if (!id) throw new Error('Failed to extract ID from response');
  return id;
}
```
