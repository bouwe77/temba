---
id: filtering
title: Filtering
sidebar_label: Filtering
sidebar_position: 10
---

# Filtering

Temba supports LHS bracket filtering on `GET` and `DELETE` collection requests by appending square-bracket operators to your field names in the query string. Every filter expression must start with the exact, lowercase `filter` prefix. String matching is case-insensitive. For example:

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
| `[eq]`         | equals (case-insensitive)                     | `?filter.name[eq]=Alice` (or `?filter.name=Alice`) |
| `[neq]`        | not equals (case-insensitive)                 | `?filter.status[neq]=archived`                     |
| `[contains]`   | substring match (case-insensitive, strings only) | `?filter.description[contains]=lorem`              |
| `[startsWith]` | prefix match (case-insensitive, strings only)    | `?filter.username[startsWith]=admin`               |
| `[endsWith]`   | suffix match (case-insensitive, strings only)    | `?filter.email[endsWith]=@example.com`             |
