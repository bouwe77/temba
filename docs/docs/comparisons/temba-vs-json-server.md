---
id: temba-vs-json-server
title: Temba vs JSON Server
sidebar_position: 1
---

# Temba vs JSON Server

This page compares feature coverage and behavior shape, not syntax.

This comparison uses JSON Server version `v0.17.4`.

## At a glance

| Area | Temba | JSON Server |
|---|---|---|
| Core REST behavior | Zero-config CRUD for resource collections plus `HEAD` support on resources. | Zero-config CRUD for plural and singular resources. |
| Data persistence / storage | In-memory by default; optional single JSON file, folder of JSON files, or MongoDB via `connectionString`. | File-backed (`db.json`) with watch mode; writes persist via lowdb. |
| Query / filter capabilities | LHS-bracket filtering via `filter.<field>[op]` with operators like `eq`, `neq`, `contains`, ranges, `in`, `regex`, etc. | Query params for filtering, operators (`_gte`, `_lte`, `_ne`, `_like`), full-text `q`, sort, paginate, slice, relation params. |
| API description / docs | Built-in OpenAPI JSON/YAML generation and interactive docs by default. | No built-in OpenAPI generation in official docs. |
| Extensibility / customization | First-class `requestInterceptor` and `responseBodyInterceptor`; custom routes recipe with your own Node server. | CLI `--routes`, `--middlewares`; module API (`create/defaults/router`) for Express-based customization. |
| Realtime / events | Built-in WebSocket broadcast channel (`/ws`) for data-change events. | No built-in WebSocket event stream in official docs. |
| Static hosting / routing | `staticFolder`, with API-prefix behavior documented to avoid route conflicts. | Serves `./public` by default; `--static` for extra static directories. |
| Traffic controls & HTTP semantics | Built-in rate limiting (enabled by default), optional CORS config, optional ETag/`If-Match` flow. | CORS/JSONP support, optional read-only mode, optional response delay, gzip toggle, host/port config. |

## Shared capabilities, different feel

### CRUD resources

Both tools provide immediate REST endpoints without needing schema-first setup.

- Temba frames this as a configurable Node library entrypoint (`create(...)`) with optional constraints such as resource allow-lists and API prefixing.
- JSON Server frames this as a file-first fake API flow (`json-server --watch db.json`) with optional module usage when you need custom Express behavior.

### Filtering, sorting, and pagination

Both support filtering/sorting/pagination, but with different query conventions.

- Temba uses a structured `filter` prefix and bracket operators (for example, `filter.name[eq]`).
- JSON Server uses shorthand query operators and utility params (`_sort`, `_order`, `_page`, `_limit`, `_start`, `_end`, `q`, `_expand`, `_embed`).

### Static file serving

Both can host static assets alongside API routes.

- Temba documents API-prefix handling explicitly when static hosting is enabled, to avoid path collisions.
- JSON Server serves from `./public` by default and can add static directories with `--static`.

### Route rewriting and custom routes

Both support adapting URLs, but at different layers.

- Temba documents a recipe for placing your own Node server in front of Temba and delegating unmatched requests.
- JSON Server provides route rewrite support via `--routes` (CLI) and `jsonServer.rewriter(...)` (module).

### Extensibility model

Both can be extended with custom logic.

- Temba provides explicit interception APIs for inbound requests and outbound successful GET response bodies.
- JSON Server emphasizes Express middleware composition and router customization (`router.render`, auth middleware, extra endpoints).

## What Temba has that JSON Server does not document

- Built-in OpenAPI generation (JSON and YAML) plus interactive docs UI.
- Built-in request-body JSON Schema validation per resource and HTTP method.
- Built-in response-body interception API specifically for successful `GET` responses.
- Built-in WebSocket broadcasts for create/update/delete/delete-all events.
- Built-in ETag flow for cache validation and optimistic concurrency (`If-None-Match`, `If-Match`).
- Built-in rate limiting enabled by default with configurable window and per-IP behavior.
- Multi-adapter persistence model in docs: memory, single file, folder-per-resource, or MongoDB with structured options.

## What JSON Server has that Temba docs do not position the same way

- Parent embedding with `_expand` for relationship expansion.
- Slice semantics with `_start`/`_end`/`_limit` in addition to pagination params.
- Full-text search via `q`.
- Snapshot support via CLI option (`--snapshots`).
- CLI-first middleware injection (`--middlewares`) without requiring a separate wrapper app.
- Remote schema loading and JS file-based data generation workflows documented as first-class CLI paths.

## When to pick which

### 1) Quick mock API from a local data file

JSON Server is a strong fit when your workflow is centered on watching and editing a local `db.json` quickly with CLI switches.

### 2) API-first development with stronger built-in API governance

Temba is a strong fit when you want OpenAPI output, request validation, ETags, and rate limiting available as built-in documented features.

### 3) Realtime updates and response customization hooks

Temba is a strong fit when you want documented built-in WebSocket change events and dedicated request/response interception hooks.

## Sources

Temba docs:
- [Getting Started](/docs/getting-started)
- [Overview](/docs/overview)
- [Data persistency](/docs/data-persistency)
- [Filtering](/docs/filtering)
- [OpenAPI](/docs/openapi)
- [Validation](/docs/schema-validation)
- [Request interception](/docs/request-interceptor)
- [Response interception](/docs/response-interceptor)
- [WebSockets](/docs/websockets)
- [Etags](/docs/etags)
- [Rate limiting](/docs/rate-limit)
- [Static assets](/docs/static-assets)
- [Custom routes recipe](/docs/recipes/custom-routes)

JSON Server:
- [JSON Server README](https://github.com/typicode/json-server/blob/v0.17.4/README.md)
