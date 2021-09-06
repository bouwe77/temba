# End-to-End Tests for Temba

These tests will be run locally (for now).

## How to:

1. Navigate to the Temba project root folder.

1. Build Temba:

```bash
npm run build
```

1. Start the test app:

```bash
node app/server.js
```

1. Check `_config.js` for the correct `hostname` and port.

1. Run the tests:

```bash
npm t
```
