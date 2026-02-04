# SelfDB JS SDK — Complete Examples

## 1. Client Setup (lib/selfdb.ts)

```typescript
import { SelfDB } from '@selfdb/js-sdk';

// Singleton client
export const selfdb = new SelfDB({
  baseUrl: process.env.SELFDB_BASE_URL || import.meta.env.VITE_SELFDB_BASE_URL,
  apiKey: process.env.SELFDB_API_KEY || import.meta.env.VITE_SELFDB_API_KEY,
});

// ============================================
// HELPER: Extract data from response
// ============================================
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

// ============================================
// HELPER: Token management
// ============================================
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

// ============================================
// HELPER: Table ID cache (REQUIRED for data ops)
// ============================================
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

// ============================================
// HELPER: Bucket ID cache (for uploads)
// ============================================
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

---

## 2. Authentication Flow

### Login and Store Tokens

```typescript
import { selfdb, setAccessToken, setRefreshToken, loadTableIds } from './lib/selfdb';

const ACCESS_TOKEN_KEY = 'selfdb_access_token';
const REFRESH_TOKEN_KEY = 'selfdb_refresh_token';

export async function login(email: string, password: string) {
  const tokens = await selfdb.auth.login({ email, password });
  
  // Store tokens
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
  
  // Set on client
  setAccessToken(tokens.access_token);
  setRefreshToken(tokens.refresh_token);
  
  // Load table IDs for future operations
  await loadTableIds();
  
  // Get current user
  const user = await selfdb.auth.me();
  return user;
}
```

### Restore Session on App Boot

```typescript
export async function initAuth() {
  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  if (!accessToken) return null;

  setAccessToken(accessToken);
  if (refreshToken) setRefreshToken(refreshToken);

  try {
    const user = await selfdb.auth.me();
    await loadTableIds();
    return user;
  } catch {
    // Try refresh if access token expired
    if (!refreshToken) return null;
    
    try {
      const tokens = await selfdb.auth.refresh({ refreshToken });
      localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
      setAccessToken(tokens.access_token);
      setRefreshToken(tokens.refresh_token);
      
      const user = await selfdb.auth.me();
      await loadTableIds();
      return user;
    } catch {
      // Refresh failed, clear tokens
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      return null;
    }
  }
}
```

### Logout

```typescript
export async function logout() {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  
  try {
    await selfdb.auth.logout({ refreshToken: refreshToken || undefined });
  } finally {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setAccessToken(null);
    setRefreshToken(null);
  }
}
```

---

## 3. User Management (Built-in Users)

**Remember: SelfDB has a built-in users table. DO NOT create your own.**

```typescript
// Create a new user (admin operation)
const newUser = await selfdb.auth.users.create({
  email: 'john@example.com',
  password: 'securePassword123',
  firstName: 'John',   // camelCase required!
  lastName: 'Doe',     // camelCase required!
  role: 'USER'         // or 'ADMIN'
});

// List all users with pagination
const users = await selfdb.auth.users.list({
  skip: 0,
  limit: 25,
  search: 'john',
  sortBy: 'createdAt',
  sortOrder: 'desc'
});

// Get specific user
const user = await selfdb.auth.users.get('user-uuid');

// Update user
const updated = await selfdb.auth.users.update('user-uuid', {
  firstName: 'Johnny',
  role: 'ADMIN'
});

// Delete user
await selfdb.auth.users.delete('user-uuid');

// Count users
const { count } = await selfdb.auth.count({ search: 'john' });
```

---

## 4. Table Operations

### Create Table with Schema

```typescript
const postsTable = await selfdb.tables.create({
  name: 'posts',
  public: false,
  table_schema: {
    id: { type: 'uuid', nullable: false },
    user_id: { type: 'uuid', nullable: false },  // References SelfDB user
    title: { type: 'text', nullable: false },
    content: { type: 'text', nullable: true },
    published: { type: 'boolean', nullable: true, default: false },
    views: { type: 'integer', nullable: true, default: 0 },
    metadata: { type: 'jsonb', nullable: true },
    created_at: { type: 'timestamp', nullable: true },
    updated_at: { type: 'timestamp', nullable: true }
  }
});

console.log('Table created with ID:', postsTable.id);
```

### List and Search Tables

```typescript
const tables = await selfdb.tables.list({
  search: 'posts',
  limit: 50,
  sortBy: 'created_at',
  sortOrder: 'desc'
});
```

### Update Table (Enable Realtime)

```typescript
await selfdb.tables.update(tableId, {
  realtime_enabled: true,
  public: false
});
```

### Column Operations

```typescript
// Add column
await selfdb.tables.columns.add(tableId, {
  name: 'category',
  type: 'varchar',
  nullable: true,
  default_value: 'general'
});

// Rename column
await selfdb.tables.columns.update(tableId, 'category', {
  new_name: 'post_category'
});

// Remove column
await selfdb.tables.columns.remove(tableId, 'post_category');
```

---

## 5. Data Operations (CRUD)

**Always use `getTableId()` - data operations require table ID, not name!**

### Insert Row

```typescript
import { selfdb, getTableId, extractId } from './lib/selfdb';

const me = await selfdb.auth.me();
const tableId = await getTableId('posts');

const row = await selfdb.tables.data.insert(tableId, {
  user_id: me.id,  // Link to current user
  title: 'My First Post',
  content: 'Hello, world!',
  published: true
});

const rowId = extractId(row);
console.log('Inserted row ID:', rowId);
```

### Update Row

```typescript
const tableId = await getTableId('posts');

await selfdb.tables.data.updateRow(tableId, rowId, {
  title: 'Updated Title',
  content: 'Updated content',
  updated_at: new Date().toISOString()
});

// With custom ID column
await selfdb.tables.data.updateRow(tableId, 'custom-id-value', updates, {
  idColumn: 'custom_id'
});
```

### Delete Row

```typescript
const tableId = await getTableId('posts');
await selfdb.tables.data.deleteRow(tableId, rowId);
```

### Query with Builder

```typescript
const tableId = await getTableId('posts');

const result = await selfdb.tables.data
  .query(tableId)
  .search('hello')           // Search in text columns
  .sort('created_at', 'desc') // Sort by column
  .page(1)                    // Page 1 (1-indexed)
  .pageSize(25)               // 25 per page
  .execute();

console.log('Posts:', result.data);
console.log('Total:', result.total);
console.log('Page:', result.page);
```

### Fetch with Options (Alternative)

```typescript
const tableId = await getTableId('posts');

const result = await selfdb.tables.data.fetch(tableId, {
  search: 'hello',
  sortBy: 'created_at',
  sortOrder: 'desc',
  page: 1,
  pageSize: 25
});
```

---

## 6. Storage Operations

### Create Bucket

```typescript
const bucket = await selfdb.storage.buckets.create({
  name: 'uploads',
  public: false
});
```

### Upload File

**Use bucketId for upload!**

```typescript
import { selfdb, getBucketId } from './lib/selfdb';

const me = await selfdb.auth.me();
const bucketId = await getBucketId('uploads');

// Upload from File/Blob
const file: File = /* from input element */;
const arrayBuffer = await file.arrayBuffer();

const upload = await selfdb.storage.files.upload(bucketId, {
  filename: file.name,
  data: arrayBuffer,
  path: `users/${me.id}/avatars`,
  contentType: file.type
});

console.log('File ID:', upload.file_id);
console.log('Path:', upload.path);
```

### Download File

**Use bucketName + path for download!**

```typescript
const arrayBuffer = await selfdb.storage.files.download({
  bucketName: 'uploads',
  path: 'users/123/avatars/photo.jpg'
});

// Convert to Blob for display
const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
const url = URL.createObjectURL(blob);
```

### List Files

```typescript
const bucketId = await getBucketId('uploads');

const result = await selfdb.storage.files.list({
  bucketId,
  search: 'photo',
  limit: 50
});

console.log('Files:', result.data);
console.log('Total:', result.total);
```

### File Metadata

```typescript
// Get file details
const file = await selfdb.storage.files.get(fileId);
console.log('Name:', file.name);
console.log('Size:', file.size);
console.log('MIME:', file.mime_type);

// Update metadata
await selfdb.storage.files.updateMetadata(fileId, {
  description: 'Profile photo',
  tags: ['avatar', 'user']
});

// Delete file
await selfdb.storage.files.delete(fileId);
```

### Storage Stats

```typescript
const stats = await selfdb.storage.files.stats();
console.log('Total files:', stats.total_files);
console.log('Total size:', stats.total_size);
console.log('Buckets:', stats.buckets_count);
```

---

## 7. Realtime Subscriptions

### Complete Flow

```typescript
import { selfdb, getTableId } from './lib/selfdb';

async function setupRealtime() {
  // 1. Ensure logged in
  await selfdb.auth.login({ email: 'user@example.com', password: 'password' });
  
  // 2. Enable realtime on table (if not enabled)
  const tableId = await getTableId('posts');
  const table = await selfdb.tables.get(tableId);
  if (!table.realtime_enabled) {
    await selfdb.tables.update(tableId, { realtime_enabled: true });
  }
  
  // 3. Connect to realtime server
  await selfdb.realtime.connect();
  console.log('Connected:', selfdb.realtime.getState());
  
  // 4. Create channel and register handlers
  const channel = selfdb.realtime
    .channel(`table:posts`)  // Use table NAME, not ID
    .on('INSERT', (payload) => {
      console.log('New post:', payload.new);
    })
    .on('UPDATE', (payload) => {
      console.log('Updated post:', payload.new);
      console.log('Was:', payload.old);
    })
    .on('DELETE', (payload) => {
      console.log('Deleted post:', payload.old);
    })
    .on('*', (payload) => {
      console.log('Any event:', payload.event, payload);
    });
  
  // 5. Subscribe to start receiving events
  await channel.subscribe();
  console.log('Channel state:', channel.getState());
  
  return { channel };
}

// Cleanup
async function cleanup(channel: RealtimeChannel) {
  await channel.unsubscribe();
  await selfdb.realtime.disconnect();
}
```

### React Hook Example

```typescript
import { useEffect, useState } from 'react';
import { selfdb, getTableId } from './lib/selfdb';
import type { RealtimePayload } from '@selfdb/js-sdk';

export function useRealtimeTable<T>(tableName: string) {
  const [data, setData] = useState<T[]>([]);
  
  useEffect(() => {
    let mounted = true;
    let channel: RealtimeChannel | null = null;
    
    async function setup() {
      // Fetch initial data
      const tableId = await getTableId(tableName);
      const result = await selfdb.tables.data.query(tableId).execute();
      if (mounted) setData(result.data as T[]);
      
      // Setup realtime
      await selfdb.realtime.connect();
      
      channel = selfdb.realtime.channel(`table:${tableName}`)
        .on('INSERT', (payload: RealtimePayload) => {
          if (mounted) setData(prev => [...prev, payload.new as T]);
        })
        .on('UPDATE', (payload: RealtimePayload) => {
          if (mounted) setData(prev => 
            prev.map(item => 
              (item as any).id === (payload.new as any).id 
                ? payload.new as T 
                : item
            )
          );
        })
        .on('DELETE', (payload: RealtimePayload) => {
          if (mounted) setData(prev => 
            prev.filter(item => (item as any).id !== (payload.old as any).id)
          );
        });
      
      await channel.subscribe();
    }
    
    setup();
    
    return () => {
      mounted = false;
      if (channel) channel.unsubscribe();
    };
  }, [tableName]);
  
  return data;
}
```

---

## 8. Error Handling

```typescript
import {
  SelfDBError,
  AuthenticationError,
  PermissionDeniedError,
  NotFoundError,
  BadRequestError,
  ConflictError,
  InternalServerError,
  APIConnectionError
} from '@selfdb/js-sdk';

async function safeOperation() {
  try {
    await selfdb.tables.get('invalid-uuid');
  } catch (error) {
    if (error instanceof AuthenticationError) {
      // 401 - Redirect to login
      console.log('Please login first');
      window.location.href = '/login';
    } else if (error instanceof PermissionDeniedError) {
      // 403 - Show access denied
      console.log('You do not have permission');
    } else if (error instanceof NotFoundError) {
      // 404 - Resource not found
      console.log('Table not found');
    } else if (error instanceof BadRequestError) {
      // 400/422 - Validation error
      console.log('Invalid request:', error.details);
    } else if (error instanceof ConflictError) {
      // 409 - Duplicate or conflict
      console.log('Resource already exists');
    } else if (error instanceof APIConnectionError) {
      // Network error
      console.log('Network error, please try again');
    } else if (error instanceof InternalServerError) {
      // 5xx - Server error
      console.log('Server error, please try later');
    } else if (error instanceof SelfDBError) {
      // Other SelfDB error
      console.log(`Error ${error.status}: ${error.message}`);
    } else {
      throw error;
    }
  }
}
```

---

## 9. User Profile Pattern

Since SelfDB manages users internally, extend with a `user_profiles` table:

```typescript
// Create user profile table (run once as admin)
await selfdb.tables.create({
  name: 'user_profiles',
  public: false,
  table_schema: {
    user_id: { type: 'uuid', nullable: false },  // PRIMARY KEY, references SelfDB user
    display_name: { type: 'text', nullable: true },
    bio: { type: 'text', nullable: true },
    avatar_file_id: { type: 'uuid', nullable: true },
    settings: { type: 'jsonb', nullable: true },
    created_at: { type: 'timestamp', nullable: true },
    updated_at: { type: 'timestamp', nullable: true }
  }
});

// Get or create profile for current user
async function getOrCreateProfile() {
  const me = await selfdb.auth.me();
  const tableId = await getTableId('user_profiles');
  
  // Try to find existing profile
  const result = await selfdb.tables.data
    .query(tableId)
    .search(me.id)
    .execute();
  
  if (result.data.length > 0) {
    return result.data[0];
  }
  
  // Create new profile
  const profile = await selfdb.tables.data.insert(tableId, {
    user_id: me.id,
    display_name: `${me.firstName} ${me.lastName}`,
    created_at: new Date().toISOString()
  });
  
  return profile;
}
```
