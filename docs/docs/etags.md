---
id: etags
title: Caching and consistency with Etags
sidebar_label: Etags
sidebar_position: 9
---

# Caching and consistency with Etags

To optimize `GET` requests, and only send JSON over the wire when it changed, you can configure to enable Etags. Etags also prevent so-called mid-air collisions, where a client tries to update en item that has been updated by another client in the meantime:

```js
const config = {
  etags: true,
}
const server = await create(config)
```

After enabling etags, every `GET` request will return an `etag` response header, which clients can (optionally) send as an `If-None-Match` header with every subsequent `GET` request. Only if the resource changed in the meantime the server will return the new JSON, and otherwise it will return a `304 Not Modified` response with an empty response body.

For updating or deleting items with a `PUT`, `PATCH`, or `DELETE`, after enabling etags, these requests are _required_ to provide an `If-Match` header with the etag. Only if the etag represents the latest version of the resource the update is made, otherwise the server responds with a `412 Precondition Failed` status code.
