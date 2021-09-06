# End-to-End Tests for Temba

The `__tests__` folder contains end to end tests. They need a running Temba server, which you can find in the `__tests__/app` folder.

So what you do to run the tests is first start the Temba server app and then run the tests. For now, this is something you do locally.

## Steps:

1. Navigate to the Temba project root folder.

2. Build Temba:

```bash
npm run build
```

3. Start the test app:

```bash
node __tests__/app/server.js
```

4. Check `__tests__/_config.js` for the correct `hostname` and port.

5. Run the tests:

```bash
cd __tests__ && npm t
```
