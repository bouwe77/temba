# 08 - Etags

Enable ETag-based caching and optimistic concurrency with `etags: true`.

**Docs:** https://temba.bouwe.io/docs/etags

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/bouwe77/temba/tree/main/examples/08%20-%20Etags)

## Try it

```
# Create an item
POST http://localhost:8362/movies
{ "title": "Dune" }

# GET returns an ETag header
GET http://localhost:8362/movies/:id
→ ETag: "abc123"

# Conditional GET — returns 304 if unchanged
GET http://localhost:8362/movies/:id
If-None-Match: "abc123"
→ 304 Not Modified

# Update requires If-Match
PATCH http://localhost:8362/movies/:id
If-Match: "abc123"
{ "year": 2021 }
→ 200 OK (412 Precondition Failed if ETag is stale)
```
