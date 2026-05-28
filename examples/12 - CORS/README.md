# 12 - CORS

Configure CORS headers using the `cors` option. By default all origins are allowed. This example restricts to a specific origin.

**Docs:** https://temba.bouwe.io/docs/cors

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/bouwe77/temba/tree/main/examples/12%20-%20CORS)

## Try it

From a browser on `https://myapp.example.com`:
```js
fetch('http://localhost:8362/movies', { credentials: 'include' })
// → works (origin matches)
```

From any other origin:
```
→ CORS preflight blocked
```

**Default CORS values:**
- `origin: '*'`
- `methods: 'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS'`
- `headers: 'Content-Type, X-Token'`
- `credentials: false`
