# Temba Development Guide

Notes to self and contributors on how to develop and release Temba.

## Testing & Linting

You can run these commands directly from the root:

```bash
npm test          # Runs tests for the Temba library
npm run lint      # Runs linting for the Temba library
```

## Manual E2E testing

If you want to spin up a real API to test the current state of your local Temba code:

```bash
./create-api-for-quick-test.sh
```

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