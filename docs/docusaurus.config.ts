import { themes as prismThemes } from 'prism-react-renderer'
import type { Config } from '@docusaurus/types'
import type * as Preset from '@docusaurus/preset-classic'

const config: Config = {
  title: 'Temba',
  tagline: 'Create a simple REST API with zero coding in less than 30 seconds (seriously)',
  favicon: 'img/favicon.ico',

  url: 'https://temba.bouwe.io',
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'bouwe77',
  projectName: 'temba-docs',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/bouwe77/temba/tree/main/docs/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  plugins: [
    [
      'docusaurus-plugin-typedoc',
      {
        entryPoints: ['../packages/temba/src/index.ts'],
        tsconfig: '../packages/temba/tsconfig.json',
        out: 'docs/api',
        sidebar: {
          autoConfiguration: true,
          pretty: true,
        },
      },
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'Temba',
      logo: {
        alt: 'Temba Logo',
        src: 'img/logo.svg',
      },
      items: [
        { to: '/docs/documentation', label: 'Documentation', position: 'left' },
        {
          href: 'https://github.com/bouwe77/temba',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'On this site',
          items: [
            {
              label: 'Documentation',
              to: '/docs/documentation',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              href: 'https://bouwe.io/categories/temba',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/bouwe77/temba',
            },
          ],
        },
      ],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
}

export default config
