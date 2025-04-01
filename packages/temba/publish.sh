#!/bin/sh

if [ "$1" != "major" ] && [ "$1" != "minor" ] && [ "$1" != "patch" ]
then
  echo ""
  echo "============================="
  echo " I N V A L I D   O P T I O N"
  echo "============================="
  echo ""
  echo "Usage: ./publish.sh [major|minor|patch]"
  echo "Example: ./publish.sh patch"
  echo ""
  exit 1
fi

if [ -z "$(git status --porcelain)" ]; then 
    # Publish Temba to npm
    version=$(npm version $1)
    npm run build
    echo "export const version = '$version'\n" > ./dist/src/version.js
    npm publish ./dist/src

    # Publish CLI to npm, and update Temba version in starter-template
    cd ../cli
    node ../../update-version.js $version create/starter-template
    npm version $version
    npm publish

    # Update Temba version in examples
    node ../../update-version.js $version ../../examples

    cd ../temba
    open "https://github.com/bouwe77/temba/releases/new?tag=$version&title=$version"
else 
  echo "Error: Commit all changes before publishing"
  exit 1
fi

