#!/bin/bash

TYPE=$1
DRY_RUN=false

if [[ " $* " =~ " --dry-run " ]]; then
  DRY_RUN=true
  echo "DRY RUN MODE ENABLED"
fi

if [ "$TYPE" != "major" ] && [ "$TYPE" != "minor" ] && [ "$TYPE" != "patch" ]; then
  echo "Usage: ./publish-mcp.sh [major|minor|patch] [--dry-run]"
  exit 1
fi

if [ "$DRY_RUN" = false ] && [ -n "$(git status --porcelain)" ]; then
  echo "Error: Commit all changes before publishing"
  exit 1
fi

if [ "$DRY_RUN" = false ]; then
  echo "Checking NPM login status..."
  if npm whoami &> /dev/null; then
    echo "Logged in as $(npm whoami)"
  else
    echo "Not logged in to NPM."
    npm login

    if [ $? -ne 0 ]; then
      echo "Login failed or was cancelled. Exiting."
      exit 1
    fi
  fi
else
  echo "[DRY RUN] Would check NPM login status"
fi

CURRENT_VERSION=$(node -p "require('./packages/mcp/package.json').version")
NEXT_VERSION=$(node -p "const [ma, mi, pa] = '$CURRENT_VERSION'.split('.').map(Number); '$TYPE' === 'major' ? \`\${ma+1}.0.0\` : '$TYPE' === 'minor' ? \`\${ma}.\${mi+1}.0\` : \`\${ma}.\${mi}.\${pa+1}\`")

echo "Releasing temba-mcp $NEXT_VERSION (from $CURRENT_VERSION)..."

run_cmd() {
  if [ "$DRY_RUN" = true ]; then
    echo "[DRY RUN] Would execute: $*"
  else
    "$@"
  fi
}

run_cmd npm version "$TYPE" -w packages/mcp --no-git-tag-version
run_cmd bash -c "echo \"export const version = '$NEXT_VERSION'\" > packages/mcp/version.js"
run_cmd npm publish -w packages/mcp

echo "Finalizing Git..."
run_cmd git add packages/mcp/package.json packages/mcp/version.js package-lock.json
run_cmd git commit -m "temba-mcp $NEXT_VERSION"

if [ "$DRY_RUN" = false ]; then
  echo "Done. temba-mcp $NEXT_VERSION published."
else
  echo "Dry run complete. No changes were made."
fi
