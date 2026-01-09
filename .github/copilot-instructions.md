# Temba - GitHub Copilot Instructions

## Project Overview

Temba is a Node.js library that enables developers to create a simple REST API with zero coding in less than 30 seconds. It's designed for quick backend prototyping and small projects.

**Key Features:**
- Zero-config REST API creation
- Automatic OpenAPI specification generation
- Multiple data storage options (in-memory, JSON file, MongoDB)
- JSON Schema validation support
- Request/response interceptors
- WebSocket support for real-time updates
- ETag support for caching
- Static file serving

## Repository Structure

This is a **monorepo** using npm workspaces:

```
temba/
├── packages/
│   ├── temba/          # Core library (TypeScript)
│   └── cli/            # CLI tool for scaffolding
├── docs/               # Docusaurus documentation site
├── examples/           # Example implementations
└── package.json        # Root workspace configuration
```

## Technology Stack

- **Language:** TypeScript (ES2022 target)
- **Module System:** ES modules (`"type": "module"`)
- **Test Framework:** Vitest
- **Linter:** ESLint with TypeScript plugin
- **Formatter:** Prettier
- **Build Tool:** TypeScript compiler (tsc) + tsc-alias
- **Key Dependencies:** ajv, lowdb, @rakered/mongo, openapi3-ts, ws

## Development Commands

From the repository root:

```bash
npm test              # Run tests for temba library
npm run lint          # Run linting for temba library
npm run check         # Run both lint and test
```

From `packages/temba`:

```bash
npm run build         # Build TypeScript to dist/
npm test              # Run tests with Vitest
npm run test:watch    # Run tests in watch mode
npm run lint          # Lint and type-check
npm run format        # Format code with Prettier
```

## Code Style & Conventions

### Prettier Configuration
- No semicolons
- Single quotes
- Trailing commas
- 2-space indentation
- 100 character line width

### TypeScript/ESLint Rules
- Use `type` instead of `interface` (enforced by `@typescript-eslint/consistent-type-definitions`)
- Unused variables with underscore prefix are allowed (e.g., `_req`)
- Strict mode enabled with `noUncheckedIndexedAccess`
- ES2022 target with Bundler module resolution

### Import Style
- Use ES module imports: `import { create } from 'temba'`
- Use Node.js built-in protocol: `import { readFileSync } from 'node:fs'`

### Testing
- Use Vitest for testing
- Integration tests in `packages/temba/test/integration/`
- Test files use `.test.ts` extension
- Use `supertest` for HTTP endpoint testing
- Tests use `isTesting: true` config to prevent actual server startup

## Key Architecture Patterns

### Data Storage Abstraction
Temba supports multiple storage backends through a unified `Queries` interface:
- **In-memory:** Default for testing and quick prototyping
- **JSON file:** Single file or folder with per-resource files
- **MongoDB:** Using `@rakered/mongo` package

Selection is based on `connectionString`:
- `null` or test env → in-memory
- Starts with `mongodb` → MongoDB
- Ends with `.json` or folder name → JSON file storage

### Request/Response Interceptors
- **Request Interceptor:** Modify requests before processing (authentication, validation, etc.)
- **Response Body Interceptor:** Transform response data before sending

### Schema Validation
- Uses AJV for JSON Schema validation
- Schemas can be configured per resource and HTTP method (POST, PUT, PATCH)
- Compiled at server startup for performance

### Resource Handling
- Dynamic resource paths with automatic CRUD operations
- Supports custom resource names (singular/plural)
- Collection and individual resource endpoints
- Optional resource validation

### WebSocket Support
- Real-time updates via `/ws` endpoint
- Broadcasts CREATE, UPDATE, DELETE, and DELETE_ALL actions
- Integrated with resource handlers

## Configuration

The main `create()` function accepts a `UserConfig` object with options:

```typescript
type UserConfig = {
  resources?: (string | ExtendedResource)[]
  staticFolder?: string
  apiPrefix?: string
  connectionString?: string
  delay?: number
  requestInterceptor?: RequestInterceptor
  responseBodyInterceptor?: ResponseBodyInterceptor
  returnNullFields?: boolean
  port?: number
  schemas?: ConfiguredSchemas
  allowDeleteCollection?: boolean
  etagsEnabled?: boolean
  openapi?: boolean | Record<string, unknown>
  webSocket?: boolean
  isTesting?: boolean
}
```

## OpenAPI Generation

- Automatic OpenAPI 3.x specification generation
- Available at `/openapi` (HTML) and `/openapi.json` (JSON)
- Interactive documentation interface
- Respects `apiPrefix` configuration

## Publishing & Versioning

- Use `./publish.sh [patch|minor|major]` from repository root
- Script handles version updates, builds, NPM publishing, and docs deployment
- Documentation is maintained in a sibling `temba-docs` repository

## Manual Testing

- Use `./create-api-for-quick-test.sh` to spin up a test API with local code
- Creates temporary API in `api-for-quick-testing` directory

## Important Notes

- All paths must include trailing slashes in URL handling
- Server uses HTTP `OPTIONS` method for CORS preflight
- Default port is 8362
- Logging can be controlled via `LOG_LEVEL` environment variable
- Static folder serving takes precedence over API routes when configured
