# Temba Development Guide

Notes to self and contributors on how to develop and release Temba.

This repo is a monorepo containing the workspaces `packages/cli`, `packages/temba`, `packages/mcp`, `docs`, and `examples`.

> [!IMPORTANT]
> As this is a monorepo, all commands are always called from the monorepo root folder,
> and never from a package subfolder.

## Testing & Linting

You can run these commands directly from the root:

```bash
npm test          # Runs tests for the Temba library and MCP package
npm run lint      # Runs linting for the Temba library
```

Or combine them in one go:

```bash
npm run check
```

To run only the MCP package tests:

```bash
npm test -w packages/mcp
```

## MongoDB E2E testing

To also run the integration tests against a real MongoDB, you need a local MongoDB
instance running on the default port (27017), then run:

```bash
npm run test:mongodb
```

This creates a temporary database, runs all test files marked with `// @mongodb`,
and drops the database when done.

To mark a test file as relevant for MongoDB testing, add this comment at the top:

```ts
// @mongodb
```

## Custom server E2E testing

To run the integration tests against a custom HTTP server (i.e. Temba embedded inside a user-supplied server), run:

```bash
npm run test:custom-server -w packages/temba
```

This runs all test files marked with `// @custom-server`.

To mark a test file as relevant for custom server testing, add this comment at the top:

```ts
// @custom-server
```

## Manual E2E testing

If you want to spin up a real API to test the current state of your local Temba code:

```bash
./create-api-for-quick-test.sh
```

## Preview the docs

To preview the docs on localhost run:

```bash
npm run docs:preview
```

## Update dependencies

To update dependencies for all workspaces run:

```
npm run update
```

## Installing new dependencies


npm install <package-name> -w <workspace-path>


## Publishing a new version

The publishing process is automated from the root of the monorepo. This script updates versions in the library, CLI, and examples, builds the code, publishes to NPM, and syncs the documentation repo.

1. Run the Publish Script

From the root folder, run the script with the version increment type:

```bash
./publish.sh [patch|minor|major]
```

> Tip: Add --dry-run to the command to see what will happen without actually publishing or pushing anything.

2. Documentation Sync

The script automatically builds the Docusaurus site and pushes the static files to the temba-docs sibling repository. Ensure that repository is cloned at the same folder level as your temba folder.

3. Finalize

After the script finishes, a browser window will open to the GitHub Releases page.

Write your release notes.

Commit and push the remaining changes in your feature branch.

Merge the PR to `main`.

## Publishing the MCP package

The MCP package is versioned independently from Temba, the CLI, examples, and docs. Do not include it in the shared `./publish.sh` release flow.

To publish a new MCP version from the root folder:

```bash
./publish-mcp.sh [patch|minor|major]
```

Use `--dry-run` to inspect the release steps without changing the version or publishing:

```bash
./publish-mcp.sh patch --dry-run
```

The script bumps only `packages/mcp/package.json`, updates `packages/mcp/version.js`, publishes only the `packages/mcp` workspace, then commits the MCP package version and lockfile changes.

For the first npm publish of an already prepared version, publish the workspace directly instead of bumping again:

```bash
npm publish -w packages/mcp
```
