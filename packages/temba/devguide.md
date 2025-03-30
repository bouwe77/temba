# Dev Guide

Notes to self, and contributors.

# Testing

Run all unit and integration tests:

```
npm test
```

Run a Temba API to quickly test it by yourself:

```
npm run build
node --watch api/index.js
```

Now Temba is running on port 4321, so you can send any request to it with whatever tool you like. Remember to run an `npm run build` with every change you make to Temba.

# Publishing a new version to NPM

Call `publish.sh` and provide either `patch`, `minor`, or `major`, example:

```
./publish.sh patch
```

This script updates the version, builds the code, and publishes to NPM.

