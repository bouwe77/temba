# 11 - API Prefix

Add a path prefix to all API routes using `apiPrefix`. All resources move under `/api/...`.

**Docs:** https://temba.bouwe.io/docs/api-prefix

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/bouwe77/temba/tree/main/examples/11%20-%20API%20Prefix)

## Try it

```
GET http://localhost:8362/api/movies   → 200 OK
GET http://localhost:8362/movies       → 404 Not Found
GET http://localhost:8362/api          → API root listing
```
