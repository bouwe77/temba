# 03 - Data Persistency

Persist data to a JSON file using `connectionString`. Data survives server restarts.

**Docs:** https://temba.bouwe.io/docs/data-persistency

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/bouwe77/temba/tree/main/examples/03%20-%20Data%20Persistency)

## Try it

```
POST http://localhost:8362/movies
{ "title": "Dune", "year": 2021 }

# Restart the server — the movie is still there
GET http://localhost:8362/movies
```
