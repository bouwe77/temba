# 09 - WebSockets

Broadcast real-time events to connected clients using `webSocket: true`.

**Docs:** https://temba.bouwe.io/docs/websockets

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/bouwe77/temba/tree/main/examples/09%20-%20WebSockets)

## Try it

1. Start the server
2. Open `client.html` in a browser to connect via WebSocket
3. Make HTTP requests — watch events arrive in real time

```
POST http://localhost:8362/movies
{ "title": "Dune" }
→ WebSocket clients receive: { "resource": "movies", "action": "CREATE", "data": { ... } }
```

Event types: `CREATE`, `UPDATE`, `DELETE`, `DELETE_ALL`
