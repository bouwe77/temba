# Creates a Temba API on the fly, to quickly test against the local build in the dist folder.

# Build Temba into the dist folder
npm run build

# Remove the current folder
rm -rf api-for-quick-testing

# Create the folder again with some minimal files
mkdir api-for-quick-testing
cd api-for-quick-testing

# Create index.js that imports Temba from the dist folder and starts the server
echo -e "import { create } from '../dist/src/index.js'\ncreate({ port: 4321 }).start()" > index.js

# Create package.json to start the server with `npm run dev`
echo '{
  "type": "module",
  "scripts": {
    "dev": "node --watch index.js"
  }
}' > package.json

# Create a readme to explain what this is
echo -e "# API for quick testing\n\nThis API is created on the fly to quickly test the Temba API against the local build in the dist folder." > README.md

# Start the just created API
npm run dev