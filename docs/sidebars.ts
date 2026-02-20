import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

// @ts-ignore
const typedocSidebar = require('./docs/api/typedoc-sidebar.cjs')

const sidebars: SidebarsConfig = {
  tembaSidebar: [
    'getting-started',
    'overview',
    'data-persistency',
    'openapi',
    'resources',
    'api-prefix',
    'static-assets',
    'schema-validation',
    'request-interceptor',
    'response-interceptor',
    'etags',
    'filtering',
    'websockets',
    {
      type: 'category',
      label: 'Recipes',
      items: ['recipes/jwt-auth'],
      collapsed: false,
    },
    {
      type: 'category',
      label: 'API Reference',
      items: typedocSidebar,
      collapsed: false,
    },
  ],
}

export default sidebars
