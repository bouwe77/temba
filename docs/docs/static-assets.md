---
id: static-assets
title: Static assets
sidebar_label: Static assets
sidebar_position: 5
---

# Static assets

If you want to host static assets, for example a web app consuming the API, you can configure a `staticFolder`:

```js
const config = {
  staticFolder: 'build',
}
const server = await create(config)
```

With this setting, sending a `GET` request to the root URL returns the content from the `'./build'` folder in your project, for example an HTML page. Files are served relative to this folder (e.g., `/index.html` → `build/index.html`, `/css/style.css` → `build/css/style.css`).

**Automatic `apiPrefix` behavior:**

To prevent conflicts between the API resources and the web app routes, configuring a `staticFolder` **automatically sets the `apiPrefix` to `"api"`**. Of course you can always change the `apiPrefix` to something else by explicitly setting it.

**Request routing order (precedence):**

When both `staticFolder` and API routes are configured, Temba processes requests in this order:

1. **Check if the request path starts with `apiPrefix + '/'`** (e.g., `/api/`)
   * If yes → Route to API handler (resources, OpenAPI, root API page)
   * If no → Continue to step 2

2. **Check if a static file exists** in the `staticFolder`
   * If yes → Serve the static file
   * If no → Return `404 Not Found`

**Example scenarios:**

| Configuration | Request | Result |
|--------------|---------|--------|
| `staticFolder: 'build'` | `GET /` | Serves `build/index.html` (if it exists) |
| `staticFolder: 'build'` | `GET /about.html` | Serves `build/about.html` (if it exists) |
| `staticFolder: 'build'` (auto-sets `apiPrefix: 'api'`) | `GET /api/movies` | API request to `/movies` resource |
| `staticFolder: 'build'`, `apiPrefix: 'v1'` | `GET /v1/movies` | API request to `/movies` resource |
| `staticFolder: 'build'`, `apiPrefix: 'v1'` | `GET /movies` | Tries to serve `build/movies` as static file |

**Key takeaway:** Static files **never** conflict with API routes when `apiPrefix` is set, because they're checked only when the request path doesn't start with the API prefix.
