// Temba example: Persisting data to a JSON file
// Docs: https://temba.bouwe.io/docs/data-persistency
//
// By default, data is stored in-memory and lost on restart.
// Setting `connectionString` to a filename persists everything
// to a single JSON file on disk — data survives server restarts.
//
// Other options:
//   connectionString: 'data'           → per-resource files in a folder
//   connectionString: 'mongodb://...'  → MongoDB
//
// Try it:
//   POST http://localhost:8362/movies
//   Body: { "title": "Dune", "year": 2021 }
//
//   Restart the server — the movie is still there.

import { create } from 'temba'

const server = await create({
  connectionString: 'data.json',
})

server.start()
