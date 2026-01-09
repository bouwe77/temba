import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

// @ts-ignore
const typedocSidebar = require('./docs/api/typedoc-sidebar.cjs')

const sidebars: SidebarsConfig = {
  tembaSidebar: [
    'documentation',
    {
      type: 'category',
      label: 'API Reference',
      items: typedocSidebar,
      collapsed: false,
    },
  ],
}

export default sidebars
