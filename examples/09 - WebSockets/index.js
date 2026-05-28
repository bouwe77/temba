// Temba example: Real-time WebSocket event broadcasting
// Docs: https://temba.bouwe.io/docs/websockets
//
// Setting `webSocket: true` starts a WebSocket server at /ws.
// Temba broadcasts a JSON message to all connected clients whenever
// a resource is created, updated, or deleted.
//
// Message format:
//   { "resource": "movies", "action": "CREATE", "data": { "id": "...", ... } }
//   { "resource": "movies", "action": "UPDATE", "data": { "id": "...", ... } }
//   { "resource": "movies", "action": "DELETE", "data": { "id": "..." } }
//   { "resource": "movies", "action": "DELETE_ALL" }
//
// Try it:
//   Open client.html in a browser (or use a WebSocket client like wscat).
//   Then make changes via HTTP — watch real-time events arrive.
//
//   POST http://localhost:8362/movies
//   Body: { "title": "Dune" }

import { create } from 'temba'

const server = await create({
  webSocket: true,
})

server.start()
