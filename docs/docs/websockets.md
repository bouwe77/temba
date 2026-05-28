---
id: websockets
title: WebSockets
sidebar_label: WebSockets
sidebar_position: 11
---

# WebSockets

Temba can automatically broadcast data changes to connected clients via WebSockets.

To enable WebSocket support:

```js
const config = {
  webSocket: true,
}
```

Once enabled, the WebSocket server is available at the same host and port as your API, using the /ws path, for example: `ws://localhost:8362/ws`

Once connected, whenever a resource is changed via a `POST`, `PUT`, `PATCH`, or `DELETE` request a message will be sent.

The broadcast message is a JSON object containing the name of the resource, the type of change (`"CREATE"`, `"UPDATE"`, `"DELETE"`, or `"DELETE_ALL"`), and the updated resource object:

```json
{
  "resource": "movies",
  "action": "CREATE",
  "data": {
    "id": "123",
    "title": "O Brother, Where Art Thou?",
    "description": "In the deep south..."
  }
}
```

For a single deletion (e.g., `DELETE /movies/123`), the data object contains only the ID of the deleted item:

```json
{
  "resource": "movies",
  "action": "DELETE",
  "data": { "id": "123" }
}
```

For a collection deletion (e.g., `DELETE /movies`), the action is `"DELETE_ALL"` and the data property is omitted entirely:

```json
{
  "resource": "movies",
  "action": "DELETE_ALL"
}
```

## Limitations

- **No authentication**: WebSocket connections bypass the `requestInterceptor`. Any client that can reach the `/ws` endpoint can connect. If you need to restrict access, do so at the network or reverse-proxy level.
- **No connection limit**: Temba does not cap the number of simultaneous WebSocket connections. For local development and small projects this is fine, but keep it in mind if your deployment is publicly accessible.
