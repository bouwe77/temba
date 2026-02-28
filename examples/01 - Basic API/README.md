# 01 - Basic API

A zero-config REST API. Temba automatically supports full CRUD for any resource name you can think of — no routing, no schema needed.

**Docs:** https://temba.bouwe.io/docs/overview

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/bouwe77/temba/tree/main/examples/01%20-%20Basic%20API)

## Try it

```
POST http://localhost:8362/movies
{ "title": "Dune", "year": 2021 }

GET  http://localhost:8362/movies
GET  http://localhost:8362/movies/:id
```

OpenAPI/Swagger UI: http://localhost:8362/openapi
