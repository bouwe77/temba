# 02 - Resources

Restrict the API to only specific resource names using `resources`. Any other resource name returns 404.

**Docs:** https://temba.bouwe.io/docs/resources

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/bouwe77/temba/tree/main/examples/02%20-%20Resources)

## Try it

```
GET http://localhost:8362/movies   → 200 OK
GET http://localhost:8362/actors   → 200 OK
GET http://localhost:8362/directors → 404 Not Found
```
