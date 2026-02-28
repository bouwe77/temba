# 10 - OpenAPI

Customize the auto-generated OpenAPI spec by passing an object to the `openapi` config. Your metadata is deep-merged into the generated spec.

**Docs:** https://temba.bouwe.io/docs/openapi

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/bouwe77/temba/tree/main/examples/10%20-%20OpenAPI)

## Try it

```
GET http://localhost:8362/openapi       → Swagger UI with custom title
GET http://localhost:8362/openapi.json  → full JSON spec
GET http://localhost:8362/openapi.yaml  → full YAML spec
```
