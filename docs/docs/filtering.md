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
| `[gt]`         | greater than                                  | `?filter.age[gt]=18`                               |
| `[gte]`        | greater than or equal                         | `?filter.price[gte]=10`                            |
| `[lt]`         | less than                                     | `?filter.score[lt]=100`                            |
| `[lte]`        | less than or equal                            | `?filter.price[lte]=100`                           |

`[eq]` and `[neq]` also work on **booleans** — use `"true"` or `"false"` as the filter value: `?filter.isActive[eq]=true`.

The `[gt]`, `[gte]`, `[lt]`, and `[lte]` operators work on both **numbers** (integers and decimals) and **strings**. String comparisons are lexicographic, which means ISO 8601 date strings (e.g. `"2026-01-31"`) sort and compare correctly by date order. Multiple operators can be combined on the same field to express a range:

```http
GET /users?filter.age[gte]=18&filter.age[lt]=65
GET /products?filter.price[gt]=9.99&filter.price[lte]=49.99
GET /events?filter.date[gte]=2026-01-01&filter.date[lt]=2027-01-01
```
