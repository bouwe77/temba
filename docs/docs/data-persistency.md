---
id: data-persistency
title: Data persistency
sidebar_label: Data persistency
sidebar_position: 1
---

# Data persistency

By default data is stored in memory. This means the data is flushed when the server restarts. To persist your data, provide the `connectionString` config setting for your JSON file(s) or MongoDB database.

**How Temba determines the storage type:**

Temba inspects the `connectionString` value to decide which adapter to use:

1. **MongoDB**: Starts with `"mongodb"` → MongoDB database
2. **Single JSON file**: Ends with `".json"` → Single file for all resources
3. **Directory of JSON files**: Matches `/^[a-zA-Z0-9_-]+$/` → Folder with one file per resource
4. **Fallback**: Any other value → In-memory storage

#### JSON file

```js
const config = {
  connectionString: 'data.json',
}
const server = await create(config)
```

All resources are stored in a single JSON file with the structure:
```json
{
  "movies": [{ "id": "1", "title": "..." }, ...],
  "actors": [{ "id": "2", "name": "..." }, ...]
}
```

The file is created automatically when the first resource is added (`POST`).

To store each resource in its own JSON file, use a folder name instead:

```js
const config = {
  connectionString: 'data',
}
const server = await create(config)
```

Each resource will be saved in a separate JSON file inside the `data` folder, created on demand when data for that resource is first added. For example:
* `data/movies.json` — Contains an array of movie objects
* `data/actors.json` — Contains an array of actor objects

**Valid folder names:** Only alphanumeric characters, hyphens, and underscores are allowed (e.g., `"data"`, `"my_data"`, `"api-db"`).

#### MongoDB

```js
const config = {
  connectionString: 'mongodb://localhost:27017/myDatabase',
}
const server = await create(config)
```

For every resource you use in your requests, a collection is created in the database. However, not until you actually create a resource with a `POST`.
