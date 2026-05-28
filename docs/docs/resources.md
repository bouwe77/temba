---
id: resources
title: Allowing specific resources only
sidebar_label: Resources
sidebar_position: 3
---

# Allowing specific resources only

If you only want to allow specific resource names, configure them by providing a `resources` key in the config object when creating the Temba server:

```js
const config = {
  resources: ['movies', 'actors'],
}
const server = await create(config)
```

Requests on these resources only give a `404 Not Found` if the ID does not exist. Requests on any other resource will always return a `404 Not Found`.
