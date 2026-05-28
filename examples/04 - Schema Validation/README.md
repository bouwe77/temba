# 04 - Schema Validation

Validate request bodies using JSON Schema with the `schemas` config. Invalid bodies return 400 Bad Request.

**Docs:** https://temba.bouwe.io/docs/schema-validation

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/bouwe77/temba/tree/main/examples/04%20-%20Schema%20Validation)

## Try it

```
# Valid — accepted
POST http://localhost:8362/movies
{ "title": "Dune", "year": 2021 }

# Invalid — missing required `title`
POST http://localhost:8362/movies
{ "year": 2021 }
→ 400 Bad Request
```
