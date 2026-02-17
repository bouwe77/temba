> [!IMOPRTANT]
> Create 4 issues for this:

### String filtering

Operators for partial text matching on strings.

- [ ] `[contains]` - substring match (`?filter.description[contains]=lorem`)
- [ ] `[icontains]` - case-insensitive substring match (`?filter.description[icontains]=LOREM`)
- [ ] `[startsWith]` - prefix match (`?filter.username[startsWith]=admin`)
- [ ] `[endsWith]` - suffix match (`?filter.email[endsWith]=@example.com`)

Add to the docs:

```md
| `[contains]`   | substring match                               | `?filter.description[contains]=lorem`              |
| `[icontains]`  | case-insensitive substring match              | `?filter.description[icontains]=LOREM`             |
| `[startsWith]` | prefix match                                  | `?filter.username[startsWith]=admin`               |
| `[endsWith]`   | suffix match                                  | `?filter.email[endsWith]=@example.com`             |
```

### Array / Set filtering

Operators to check if a value exists within a provided list of options.

- [ ] `[in]` - matches one of a list of values (`?filter.age[in]=18,21,65`)
- [ ] `[nin]` - does not match any in a list of values (`?filter.status[nin]=draft,pending`)

Add to the docs:

```md
| `[in]`         | one of a list of values                       | `?filter.age[in]=18,21,65`                         |
| `[nin]`        | not in a list of values                       | `?filter.status[nin]=draft,pending`                |
```

### Number and date filtering

Operators to evaluate the magnitude of numbers or chronological order of dates.

- [ ] `[gt]` - greater than (`?filter.age[gt]=18`)
- [ ] `[gte]` - greater than or equal (`?filter.price[gte]=10`)
- [ ] `[lt]` - less than (`?filter.score[lt]=100`)
- [ ] `[lte]` - less than or equal (`?filter.price[lte]=100`)

Add to the docs:

```md
| `[gt]`         | greater than                                  | `?filter.age[gt]=18`                               |
| `[gte]`        | greater than or equal                         | `?filter.price[gte]=10`                            |
| `[lt]`         | less than                                     | `?filter.score[lt]=100`                            |
| `[lte]`        | less than or equal                            | `?filter.price[lte]=100`                           |
```

### Advanced Operators

Operators for structural evaluation and pattern matching. Invalid regex syntax must return a `400 Bad Request`.

- [ ] `[exists]` - field is present or absent (`?filter.email[exists]=true`)
- [ ] `[regex]` - full regular-expression match (`?filter.name[regex]=^A.*e$`)

Add to the docs:

```md
| `[exists]`     | field is present (`true`) or absent (`false`) | `?filter.email[exists]=true`                       |
| `[regex]`      | full regular-expression match (URL-encode)    | `?filter.name[regex]=^A.*e$` → `%5E%A.*e%24`       |
```
