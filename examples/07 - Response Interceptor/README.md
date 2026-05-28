# 07 - Response Interceptor

Transform GET response bodies before they are sent using `responseBodyInterceptor`. This example adds a computed `_link` field to every movie.

**Docs:** https://temba.bouwe.io/docs/response-interceptor

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/bouwe77/temba/tree/main/examples/07%20-%20Response%20Interceptor)

## Try it

```
POST http://localhost:8362/movies
{ "title": "Dune" }

GET http://localhost:8362/movies
→ each item now has a `_link` field added
```
