import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

// @ts-ignore
const typedocSidebar = require('./docs/api/typedoc-sidebar.cjs')

const sidebars: SidebarsConfig = {
  tembaSidebar: [
    'getting-started',
    'overview',
    {
      type: 'category',
      label: 'Features',
      className: 'sidebar-section',
      items: [
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
      ],
      collapsed: false,
    },
    {
      type: 'category',
      label: 'Recipes',
      className: 'sidebar-section',
      items: ['recipes/jwt-auth', 'recipes/serving-a-frontend'],
      collapsed: false,
    },
    {
      type: 'category',
      label: 'API Reference',
      className: 'sidebar-section',
      items: typedocSidebar,
      collapsed: false,
    },
  ],
}

export default sidebars
