---
id: filtering
title: Filtering
sidebar_label: Filtering
sidebar_position: 10
---

# Filtering

Temba supports JSON:API style filtering on `GET` and `DELETE` collection requests by appending square-bracket operators to your field names in the query string. Every filter expression must start with the exact, lowercase `filter` prefix. For example:

`GET /items?filter.name[eq]=Alice&filter.status[neq]=archived`

You can mix dots and brackets in any combination when specifying filters (e.g. `filter.role.eq=admin`, `filter.role[eq]=admin`, `filter[role].eq=admin`, `filter[role][eq]=admin`, etc.), but the recommended—and most common—style is to put the operator between brackets:

```http
GET /users?filter.role[eq]=admin
```

Omitting the operator defaults to an `[eq]` operator, so both of these are equivalent:

```http
GET /users?filter.role=admin
GET /users?filter.role[eq]=admin
```

**Note on validation:** Unknown field names are safely ignored (returning empty results). However, malformed expressions, incorrectly cased operators (e.g., `[EQ]`), or unsupported operators will return a `400 Bad Request`.

The following operators are supported:

| Operator       | Description                                   | Example                                            |
| -------------- | --------------------------------------------- | -------------------------------------------------- |
| `[eq]`         | strict equals                                 | `?filter.name[eq]=Alice` (or `?filter.name=Alice`) |
| `[ieq]`        | case-insensitive equals                       | `?filter.name[ieq]=alice`                          |
| `[neq]`        | strict not equals                             | `?filter.status[neq]=archived`                     |
| `[ineq]`       | case-insensitive not equals                   | `?filter.status[ineq]=ARCHIVED`                    |
