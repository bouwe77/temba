#!/bin/bash

# 1. Build the library first to ensure dist is fresh
npm run build -w packages/temba

# 2. Setup the test directory
rm -rf api-for-quick-testing
mkdir api-for-quick-testing
cd api-for-quick-testing

# 3. Create index.js 
echo "import { create } from '../packages/temba/dist/index.js'

const server = await create({
  port: 4321,
})
server.start()
" > index.js

# 4. Create package.json
echo '{
  "type": "module",
  "scripts": {
    "dev": "node --watch index.js"
  }
}' > package.json

# 5. Start it
echo "🚀 Starting test API on port 4321..."
npm run dev