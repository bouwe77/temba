# 05 - Filtering

Filter collections using LHS bracket query strings. No configuration needed — filtering is built in.

**Docs:** https://temba.bouwe.io/docs/filtering

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/bouwe77/temba/tree/main/examples/05%20-%20Filtering)

## Try it

```
# Add some data first
POST http://localhost:8362/movies
{ "title": "Dune", "genre": "sci-fi" }

POST http://localhost:8362/movies
{ "title": "The Godfather", "genre": "drama" }

# Then filter
GET http://localhost:8362/movies?filter.genre[eq]=sci-fi
GET http://localhost:8362/movies?filter.genre[neq]=drama
```

Supported operators: `[eq]`, `[neq]`
