# Creates a Temba API on the fly, to quickly test against the local build in the dist folder.

# Build Temba into the dist folder
npm run build

# Remove the current folder
rm -rf api-for-quick-testing

# Create the folder again with some minimal files
mkdir api-for-quick-testing
cd api-for-quick-testing

# Create index.js that imports Temba from the dist folder and starts the server
echo "import { create } from '../dist/src/index.js'

create({
  port: 4321,
}).start()
" > index.js

# Create package.json to start the server with `npm run dev`
echo '{
  "type": "module",
  "scripts": {
    "dev": "node --watch index.js"
  }
}' > package.json

# Create a readme to explain what this is
echo "# API for quick testing

This API is created on the fly to quickly test the Temba API against the local build in the \`dist\` folder.
" > README.md

# Copy the OpenAPI HTML page
cp ../src/openapi/openapi.html ./openapi.html

# Start the just created API
npm run dev