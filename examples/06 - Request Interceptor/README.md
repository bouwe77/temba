# 06 - Request Interceptor

Intercept requests before Temba handles them using `requestInterceptor`. This example implements simple token-based auth.

**Docs:** https://temba.bouwe.io/docs/request-interceptor

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/bouwe77/temba/tree/main/examples/06%20-%20Request%20Interceptor)

## Try it

```
# Rejected — missing token
POST http://localhost:8362/movies
{ "title": "Dune" }
→ 401 Unauthorized

# Accepted — correct token
POST http://localhost:8362/movies
Headers: X-Token: secret
{ "title": "Dune" }
→ 201 Created

# GET is always allowed (no interceptor on get)
GET http://localhost:8362/movies
→ 200 OK
```
