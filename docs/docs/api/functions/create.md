# Function: create()

> **create**(`userConfig?`): `Promise`\<\{ `server`: `Server`\<*typeof* `IncomingMessage`, *typeof* `ServerResponse`\>; `start`: () => `Server`\<*typeof* `IncomingMessage`, *typeof* `ServerResponse`\> \| `undefined`; \}\>

Defined in: [index.ts:130](https://github.com/bouwe77/temba/blob/d702061eea6229c7378afad0c5955c090a64f56f/packages/temba/src/index.ts#L130)

Creates a Temba REST API server with the specified configuration.

Temba provides a zero-configuration REST API that supports CRUD operations
for any resource. Data can be stored in-memory, in JSON files, or in MongoDB.

## Parameters

### userConfig?

[`UserConfig`](../type-aliases/UserConfig.md)

Optional configuration object to customize the server behavior

## Returns

`Promise`\<\{ `server`: `Server`\<*typeof* `IncomingMessage`, *typeof* `ServerResponse`\>; `start`: () => `Server`\<*typeof* `IncomingMessage`, *typeof* `ServerResponse`\> \| `undefined`; \}\>

A promise that resolves to an object containing:
  - `start()`: Function to start the HTTP server
  - `server`: The underlying Node.js HTTP server instance

## Example

```typescript
// Create a basic server with default settings
const server = await create();
server.start();

// Create a server with custom configuration
const server = await create({
  port: 3000,
  resources: ['movies', 'actors'],
  connectionString: 'mongodb://localhost:27017/mydb'
});
server.start();
```
