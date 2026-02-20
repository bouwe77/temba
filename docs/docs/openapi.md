---
id: openapi
title: OpenAPI specification
sidebar_label: OpenAPI
sidebar_position: 2
---

# OpenAPI specification

OpenAPI support in Temba is enabled by default, automatically generating both JSON and YAML specifications that accurately reflect your configured resources and settings.

Alongside these specs, Temba serves interactive HTML documentation (i.e. Swagger UI) out of the box.

OpenAPI support is controlled through the `openapi` setting, which accepts two forms:

* **Boolean**

  * `true` (default) enables OpenAPI support.
  * `false` disables it completely.

* **Object**

  * Supplying an object both enables OpenAPI **and** lets you customize the spec.
  * The object must adhere to the `OpenAPIObject` interface (see [openapi3-ts model](https://github.com/metadevpro/openapi3-ts/blob/71b55d772bacc58c127540b6a75d1b17a7ddadbb/src/model/openapi31.ts)).
  * Temba will deep-merge your custom specification into its default spec, preserving all auto-generated endpoints and schemas while applying your overrides.
