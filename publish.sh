#!/bin/bash

# 1. Configuration & Input
TYPE=$1
DRY_RUN=false
if [[ " $* " =~ " --dry-run " ]]; then
  DRY_RUN=true
  echo "⚠️  DRY RUN MODE ENABLED"
fi

if [ "$TYPE" != "major" ] && [ "$TYPE" != "minor" ] && [ "$TYPE" != "patch" ]; then
  echo "Usage: ./publish.sh [major|minor|patch] [--dry-run]"
  exit 1
fi

if [ "$DRY_RUN" = false ] && [ -n "$(git status --porcelain)" ]; then 
  echo "❌ Error: Commit all changes before publishing"
  exit 1
fi

# --- NPM LOGIN CHECK ---
echo "👤 Checking NPM login status..."
if npm whoami &> /dev/null; then
  echo "✅ Logged in as $(npm whoami)"
else
  echo "⚠️  Not logged in to NPM."
  if [ "$DRY_RUN" = false ]; then
    echo "🔐 Initiating login..."
    npm login
    
    if [ $? -ne 0 ]; then
      echo "❌ Login failed or was cancelled. Exiting."
      exit 1
    fi
    echo "✅ Login successful!"
  else
    echo "[DRY RUN] Would run: npm login"
  fi
fi

# --- SAFETY CHECK ---
echo "🔍 Running pre-publish checks (lint & test)..."
if [ "$DRY_RUN" = false ]; then
  npm run check
  if [ $? -ne 0 ]; then
    echo "❌ Error: Checks failed. Fix linting/tests before publishing."
    exit 1
  fi
else
  echo "[DRY RUN] Would run: npm run check"
fi

# 2. Version Calculation
CURRENT_VERSION=$(node -p "require('./packages/temba/package.json').version")
NEXT_VERSION=$(node -p "const [ma, mi, pa] = '$CURRENT_VERSION'.split('.').map(Number); '$TYPE' === 'major' ? \`\${ma+1}.0.0\` : '$TYPE' === 'minor' ? \`\${ma}.\${mi+1}.0\` : \`\${ma}.\${mi}.\${pa+1}\`")

echo "🚀 Releasing $NEXT_VERSION (from $CURRENT_VERSION)..."

# Helper function to run commands or print them in dry-run
run_cmd() {
  if [ "$DRY_RUN" = true ]; then
    echo "[DRY RUN] Would execute: $*"
  else
    eval "$@"
  fi
}

# 3. Process Temba Library
echo "📦 Processing Temba library..."
# Updates package.json inside the workspace
run_cmd "npm version $TYPE -w packages/temba --no-git-tag-version"

# Update the version.ts file (Using bash -c to handle the redirect in eval)
run_cmd "bash -c \"echo 'export const version = \\\"$NEXT_VERSION\\\"' > packages/temba/src/version.ts\""

# Build the workspace
run_cmd "npm run build -w packages/temba"

# Publish the specific build folder. 
# Note: We don't use -w here because we are targeting a specific subfolder artifact.
run_cmd "npm publish packages/temba/dist/src"


# 4. Process CLI
echo "💻 Processing CLI..."
run_cmd "npm version $NEXT_VERSION -w packages/cli --no-git-tag-version"
run_cmd "node update-version.js $NEXT_VERSION packages/cli $( [ "$DRY_RUN" = true ] && echo "--dry-run" )"
run_cmd "node update-version.js $NEXT_VERSION packages/cli/create/starter-template $( [ "$DRY_RUN" = true ] && echo "--dry-run" )"
run_cmd "npm publish -w packages/cli"

# 5. Update Examples
echo "📚 Updating examples..."
run_cmd "node update-version.js $NEXT_VERSION examples $( [ "$DRY_RUN" = true ] && echo "--dry-run" )"

# 6. Documentation
echo "📝 Updating Docs version and deploying..."
run_cmd "node update-version.js $NEXT_VERSION docs $( [ "$DRY_RUN" = true ] && echo "--dry-run" )"

run_cmd "npm run docs:deploy"

# 7. Wrap up
echo "🔗 Finalizing Git..."
run_cmd "git add ."
run_cmd "git commit -m \"$NEXT_VERSION\""

if [ "$DRY_RUN" = false ]; then
  echo "🌍 Opening GitHub to finalize release notes..."
  open "https://github.com/bouwe77/temba/releases/new?tag=$NEXT_VERSION&title=$NEXT_VERSION"
  echo "✅ Done! All packages updated and docs deployed."
else
  echo "🏁 Dry run complete. No changes were made."
fi