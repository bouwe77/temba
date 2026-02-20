---
id: api-prefix
title: API prefix
sidebar_label: API prefix
sidebar_position: 4
---

# API prefix

With the `apiPrefix` config setting, all resources get an extra path segment in front of them. If the `apiPrefix` is `'api'`, then `/movies/12345` becomes `/api/movies/12345`:

```js
const config = {
  apiPrefix: 'api',
}
const server = await create(config)
```

Notes:

* Only alphanumeric characters are kept—special characters are stripped. For example, `apiPrefix: 'api/v1'` becomes `'apiv1'`.
* After configuring the `apiPrefix`, requests to the root URL (e.g., `http://localhost:8362/`) will return:
  * `404 Not Found` on `GET` requests
  * `405 Method Not Allowed` for any other HTTP method
* The new root becomes `/api` (or whatever your prefix is), which returns an informational page.
