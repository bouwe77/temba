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

# 2. Version Calculation (Strictly numeric)
CURRENT_VERSION=$(node -p "require('./packages/temba/package.json').version")
NEXT_VERSION=$(node -p "const [ma, mi, pa] = '$CURRENT_VERSION'.split('.').map(Number); '$TYPE' === 'major' ? \`\${ma+1}.0.0\` : '$TYPE' === 'minor' ? \`\${ma}.\${mi+1}.0\` : \`\${ma}.\${mi}.\${pa+1}\`")

echo "🚀 Releasing $NEXT_VERSION (from $CURRENT_VERSION)..."

run_cmd() {
  if [ "$DRY_RUN" = true ]; then
    echo "[DRY RUN] Would execute: $*"
  else
    eval "$@"
  fi
}

# 3. Process Temba Library
echo "📦 Processing Temba library..."
if [ "$DRY_RUN" = false ]; then
    cd packages/temba
    npm version $TYPE --no-git-tag-version
    echo "export const version = '$NEXT_VERSION';" > ./src/version.ts
    npm run build
    npm publish ./dist/src
    cd ../..
else
    echo "[DRY RUN] Bump version, write src/version.ts with '$NEXT_VERSION', build, and publish temba"
fi

# 4. Process CLI
echo "💻 Processing CLI..."
run_cmd "cd packages/cli && npm version $NEXT_VERSION --no-git-tag-version && cd ../.."
run_cmd "node update-version.js $NEXT_VERSION packages/cli $( [ "$DRY_RUN" = true ] && echo "--dry-run" )"
run_cmd "node update-version.js $NEXT_VERSION packages/cli/create/starter-template $( [ "$DRY_RUN" = true ] && echo "--dry-run" )"
run_cmd "cd packages/cli && npm publish && cd ../.."

# 5. Update Examples
echo "📚 Updating examples..."
run_cmd "node update-version.js $NEXT_VERSION examples $( [ "$DRY_RUN" = true ] && echo "--dry-run" )"

# 6. Documentation
echo "📝 Processing Docs..."
run_cmd "cd docs && npm run build && cd .."

DOCS_REPO="../temba-docs"
if [ -d "$DOCS_REPO" ]; then
  if [ "$DRY_RUN" = true ]; then
    echo "[DRY RUN] Would sync docs to $DOCS_REPO and push to git"
  else
    cp -R docs/dist/* "$DOCS_REPO/"
    cd "$DOCS_REPO"
    git add .
    git commit -m "docs: update to $NEXT_VERSION"
    git push
    cd ../temba
  fi
else
  echo "⚠️  Docs repo not found at $DOCS_REPO"
fi

# 7. Wrap up
echo "🔗 Finalizing Git..."
run_cmd "git add ."
run_cmd "git commit -m \"chore: release $NEXT_VERSION\""

if [ "$DRY_RUN" = false ]; then
  echo "🌍 Opening GitHub to finalize release notes..."
  open "https://github.com/bouwe77/temba/releases/new?tag=$NEXT_VERSION&title=$NEXT_VERSION"
  echo "✅ Done! All packages updated and docs synced."
else
  echo "🏁 Dry run complete. No changes were made."
fi