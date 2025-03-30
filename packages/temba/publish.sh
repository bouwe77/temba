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
    version=$(npm version $1)
    npm run build
    echo "export const version = '$version'\n" > ./dist/src/version.js
    npm publish ./dist/src
    # cd ..

    # cd cli
    # npm version $version
    # npm publish
    # cd ..

    node ./cli/update-version.js $version

    open "https://github.com/bouwe77/temba/releases/new?tag=$version&title=$version&prerelease=1"
else 
  echo "Error: Commit all changes before publishing"
  exit 1
fi

