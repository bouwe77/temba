---
id: static-assets
title: Static assets
sidebar_label: Static assets
sidebar_position: 5
---

If you want to host static content, such as a web app that consumes your API, you can configure a `staticFolder`. This allows Temba to host your frontend assets alongside your API.

Configuring a `staticFolder` automatically sets the `apiPrefix` to `"api"`. This is a strict requirement to ensure that API requests and page navigation remain separate.

To enable static content, add the folder name to your configuration. Usually, this is the folder where your build process outputs files, like `dist` or `build`.

```js
const config = {
  staticFolder: 'build',
}
const server = await create(config)
```

**Note** A physical `index.html` must exist in the `staticFolder`, otherwise a 404 is returned for any non-API request.

As further explained below, by default Temba tries to resolve each request URL to a physical file first and otherwise generally serves `index.html`. This is called `"spa"` mode.

If you want to only allow requests to actually existing files, and otherwise return a 404, use `"filesystem"` mode, by configuring `staticFolder` as an object:

```js
const config = {
  staticFolder: {
    path: 'build',
    mode: 'filesystem',
  },
}
const server = await create(config)
```

For most projects, this is all you need to know about static content. If your application has complex routing or want to understand exactly how requests are handled, the details are below.

---

# How it works

## Request routing order

When you use a `staticFolder`, Temba processes every incoming request in a specific order of precedence. This ensures that your API works correctly and your static files are served efficiently.

1. **API prefix check**<br/>If the request path starts with `/api/`, it is handled by the API. If the resource does not exist, Temba returns an API-flavored 404 error. Static files are never checked for these requests.

2. **Physical file check**<br/>If the request is not for the API, Temba looks for a physical file in your `staticFolder` that matches the URL. If it finds one, it serves it.

3. **SPA fallback logic**<br/>If no physical file exists, Temba determines if it should serve your `index.html` as a fallback. This happens only when:

- The mode is set to `"spa"` (the default).
- The request is a `GET` and the `Accept` header includes `text/html`.
- **And** either the last segment of the URL contains no dot (e.g., `/dashboard`), or it is a path that explicitly requests HTML despite having a dot (e.g., `/user/john.doe`).

Note: Requests for directories without a trailing slash (like `/admin`) will be automatically redirected to `/admin/` if an `index.html` is found in that directory.

When these conditions are met, Temba searches for the nearest index.html by walking back through the URL path segments starting from the requested location.

- **Direct match** It checks the requested directory for an `index.html`.
- **Walk back** If not found, it moves up one directory level and checks again.
- **Root fallback** This continues until it either finds an `index.html` or reaches the root of the `staticFolder`.

4.  **404 not found**<br/>If none of the above conditions are met, the server returns a standard 404.

## Single page application (SPA) support

Temba natively supports client-side routing using the History API. This means you can use libraries like React Router or Vue Router with "clean" URLs without the page breaking on a refresh.

By checking the `Accept` header and looking for dots in the URL, Temba intelligently decides when to send the user back to your `index.html` entry point and when to correctly report a missing asset.

## Example scenarios

The following examples assume that the staticFolder is configured as 'build'.

| request                  | result                                                   |
| :----------------------- | :------------------------------------------------------- |
| `GET /`                  | serves `build/index.html`                                |
| `GET /api/movies`        | API request for movies resource                          |
| `GET /css/style.css`     | serves `build/css/style.css` (physical file check)       |
| `GET /dashboard`         | no file found; serves `build/index.html` (SPA fallback)  |
| `GET /user/john.doe`     | browser asks for HTML; serves `build/index.html`         |
| `GET /missing-style.css` | no file found; dot detected in last segment; returns 404 |
