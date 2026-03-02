---
id: data-persistency
title: Data persistency
sidebar_label: Data persistency
sidebar_position: 1
---

# Data persistency

By default data is stored in memory. This means the data is flushed when the server restarts. To persist your data, provide the `connectionString` config setting for your JSON file(s) or MongoDB database.

`connectionString` accepts either a **string shorthand** (simple, great for quick setups) or a **`DataSourceConfig` object** (structured, full TypeScript autocomplete).

**How Temba determines the storage type from a string:**

Temba inspects the `connectionString` value to decide which adapter to use:

1. **MongoDB**: Starts with `"mongodb"` → MongoDB database
2. **Single JSON file**: Ends with `".json"` → Single file for all resources
3. **Directory of JSON files**: Matches `/^[a-zA-Z0-9_-]+$/` → Folder with one file per resource
4. **Fallback**: Any other value → In-memory storage

Both the JSON file and folder paths are resolved relative to the directory from which you start the server.

#### JSON file

All resources are stored in a single JSON file with the structure:
```json
{
  "movies": [{ "id": "1", "title": "..." }, ...],
  "actors": [{ "id": "2", "name": "..." }, ...]
}
```

The file is created automatically when the first resource is added (`POST`).

```js title="String shorthand"
const server = await create({
  connectionString: 'data.json',
})
```

```js title="Object form"
const server = await create({
  connectionString: { type: 'file', filename: 'data.json' },
})
```

#### Folder of JSON files

To store each resource in its own JSON file, use a folder name. Each resource will be saved in a separate JSON file inside the folder, created on demand when data for that resource is first added. For example:
* `data/movies.json` — Contains an array of movie objects
* `data/actors.json` — Contains an array of actor objects

**Valid folder names for the string shorthand:** Only alphanumeric characters, hyphens, and underscores are allowed (e.g., `"data"`, `"my_data"`, `"api-db"`).

```js title="String shorthand"
const server = await create({
  connectionString: 'data',
})
```

```js title="Object form"
const server = await create({
  connectionString: { type: 'folder', folder: 'data' },
})
```

#### MongoDB

```js title="String shorthand"
const server = await create({
  connectionString: 'mongodb://localhost:27017/myDatabase',
})
```

```js title="Object form"
const server = await create({
  connectionString: { type: 'mongodb', uri: 'mongodb://localhost:27017/myDatabase' },
})
```

For every resource you use in your requests, a collection is created in the database. However, not until you actually create a resource with a `POST`.

The object form also lets you configure additional MongoDB connection options without embedding them in the URI:

```js title="MongoDB with extra options"
const server = await create({
  connectionString: {
    type: 'mongodb',
    uri: 'mongodb://localhost:27017/myDatabase',
    username: 'alice',
    password: 's3cr3t',
    authSource: 'admin',
    tls: true,
    tlsCAFile: '/certs/ca.pem',
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  },
})
```

The full set of available MongoDB options:

| Option | Type | Description |
|---|---|---|
| `uri` | `string` | MongoDB connection URI (**required**) |
| `username` | `string` | Username for authentication |
| `password` | `string` | Password for authentication |
| `authSource` | `string` | Authentication database (defaults to `'admin'`) |
| `tls` | `boolean` | Enable TLS/SSL |
| `tlsCAFile` | `string` | Path to the CA certificate file |
| `tlsCertificateKeyFile` | `string` | Path to the client certificate/key file |
| `tlsAllowInvalidCertificates` | `boolean` | Allow invalid TLS certificates (not recommended for production) |
| `maxPoolSize` | `number` | Maximum connections in the connection pool |
| `minPoolSize` | `number` | Minimum connections in the connection pool |
| `serverSelectionTimeoutMS` | `number` | Timeout (ms) for server selection |
| `connectTimeoutMS` | `number` | Timeout (ms) for initial connection |
| `replicaSet` | `string` | Replica set name |
| `readPreference` | `string` | Read preference (e.g. `'primary'`, `'secondary'`, `'nearest'`) |
| `writeConcern` | `string` | Write concern (e.g. `'majority'`) |
