---
id: examples
title: Examples
sidebar_position: 3
---

# Examples

Each example is self-contained and demonstrates one specific feature. Click **Open in StackBlitz** to run it directly in your browser, or view the source on GitHub.

| # | Example | Feature | Config setting(s) | Links |
|---|---------|---------|-------------------|-------|
| 01 | Basic API | Zero-config CRUD for any resource | _(none)_ | [Source](https://github.com/bouwe77/temba/tree/main/examples/01%20-%20Basic%20API) · [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/bouwe77/temba/tree/main/examples/01%20-%20Basic%20API) |
| 02 | Resources | Restrict API to specific resource names | `resources` | [Source](https://github.com/bouwe77/temba/tree/main/examples/02%20-%20Resources) · [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/bouwe77/temba/tree/main/examples/02%20-%20Resources) |
| 03 | Data Persistency | Persist data to a JSON file | `connectionString` | [Source](https://github.com/bouwe77/temba/tree/main/examples/03%20-%20Data%20Persistency) · [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/bouwe77/temba/tree/main/examples/03%20-%20Data%20Persistency) |
| 04 | Schema Validation | Validate request bodies with JSON Schema | `schemas` | [Source](https://github.com/bouwe77/temba/tree/main/examples/04%20-%20Schema%20Validation) · [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/bouwe77/temba/tree/main/examples/04%20-%20Schema%20Validation) |
| 05 | Filtering | Filter collections with query strings | _(built-in)_ | [Source](https://github.com/bouwe77/temba/tree/main/examples/05%20-%20Filtering) · [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/bouwe77/temba/tree/main/examples/05%20-%20Filtering) |
| 06 | Request Interceptor | Intercept requests (e.g. token auth) | `requestInterceptor` | [Source](https://github.com/bouwe77/temba/tree/main/examples/06%20-%20Request%20Interceptor) · [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/bouwe77/temba/tree/main/examples/06%20-%20Request%20Interceptor) |
| 07 | Response Interceptor | Transform GET response bodies | `responseBodyInterceptor` | [Source](https://github.com/bouwe77/temba/tree/main/examples/07%20-%20Response%20Interceptor) · [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/bouwe77/temba/tree/main/examples/07%20-%20Response%20Interceptor) |
| 08 | Etags | ETag caching and optimistic concurrency | `etags` | [Source](https://github.com/bouwe77/temba/tree/main/examples/08%20-%20Etags) · [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/bouwe77/temba/tree/main/examples/08%20-%20Etags) |
| 09 | WebSockets | Real-time event broadcasting | `webSocket` | [Source](https://github.com/bouwe77/temba/tree/main/examples/09%20-%20WebSockets) · [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/bouwe77/temba/tree/main/examples/09%20-%20WebSockets) |
| 10 | OpenAPI | Custom OpenAPI spec metadata | `openapi` | [Source](https://github.com/bouwe77/temba/tree/main/examples/10%20-%20OpenAPI) · [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/bouwe77/temba/tree/main/examples/10%20-%20OpenAPI) |
| 11 | API Prefix | Add a path prefix to all routes | `apiPrefix` | [Source](https://github.com/bouwe77/temba/tree/main/examples/11%20-%20API%20Prefix) · [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/bouwe77/temba/tree/main/examples/11%20-%20API%20Prefix) |
| 12 | CORS | Custom CORS configuration | `cors` | [Source](https://github.com/bouwe77/temba/tree/main/examples/12%20-%20CORS) · [![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz_small.svg)](https://stackblitz.com/github/bouwe77/temba/tree/main/examples/12%20-%20CORS) |

All examples use the latest published version of Temba from npm. To run one locally:

```bash
cd "examples/01 - Basic API"
npm install
npm start
```
