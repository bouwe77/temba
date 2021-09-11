# Unit and integration tests

Run these with:

```bash
npm t
```

# End-to-End Tests

The `__tests__/e2e` folder contains end to end tests. They need a running Temba server, which you can find in the `__tests__/e2e/app` folder.

So what you do to run the E2E tests is first start the Temba server app and then run the tests. For now, this is something you do manually and locally, it's not part of CI.

## Steps:

1. Navigate to the Temba project root folder.

2. Build Temba:

```bash
npm run build
```

3. Start the test app:

```bash
node __tests__/e2e/app/server.js
```

4. Check `__tests__/e2e/_config.js` for the correct `hostname` and port.

5. Run the E2E tests:

```bash
cd __tests__ && npm run tests:e2e
```
