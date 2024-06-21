# Auth

> #### ⚠️ EXPERIMENTAL, YOU MIGHT NOT WANT TO USE THIS

Temba does not yet officially support auth, so the code in this folder is just some experimentation for internal use, which might (or might not) work...

Also, it does not follow security best practices.

# How it works

Once enabled, you need to add one or more tokens in the `tokens` collection of your database, and then every request to Temba requires an `X-TOKEN` header containing a token that should exist.

In other words, Temba does not offer a way to store tokens, only a way to use (authorize with) them.

It only works if you use a MongoDB or JSON file, as you need to store tokens somewhere.

Also, once this feature is enabled, you can not use the `/tokens` resource anymore, as it will be blocked returning `404 Not Found`.

# Getting Started

1. Add `FEATURE_FLAG_SIMPLE_AUTH=true` to your environment variables.

2. Insert one or more tokens in a collection called `tokens`, for example:

```
{
  "id": "1@qW3$eR5TY6&uI8"
}
```

> The `id` contains the token, no additional fields are necessary.

3. Send requests to Temba containing an `X-TOKEN` header with an existing token, or a `401 Unauthorized` response will be given.