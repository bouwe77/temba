---
id: getting-started
title: Getting Started
sidebar_position: 1
---

# Getting Started

Prerequisites you need to have:

* Node
* NPM

- Optional: A MongoDB database, either locally or in the cloud

### Use the starter with `npx`

Create your own Temba server instantly:

```
npx temba-cli create my-rest-api
```

This command will:

* Create a new folder called `my-rest-api`
* Install Temba as a dependency
* Generate a `server.js` file
* Automatically start your brand-new Temba API

You'll see:

```
✅ Server listening on port 8362
```

Now you can send any HTTP request to any resource on localhost:8362 — and it just works.

Or head over to the interactive OpenAPI specification of your API in your browser at `/openapi`.

### Adding to an existing app

Alternatively, add Temba to your app manually:

1. `npm i temba`

2. Example code to create a Temba server:

```js
import { create } from "temba"
const server = await create()
server.start()
```

3. In your console you'll see:

```
✅ Server listening on port 8362
```

### Configuration

To opt-out or customize Temba's workings, pass a `config` object to the `create` function. Check out the individual feature pages in the sidebar, or the [config settings overview](/docs/overview#config-settings-overview).
