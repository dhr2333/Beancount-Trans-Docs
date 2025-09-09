import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Beancount-Trans',
  tagline: '让无会计知识的普通用户也能轻松使用专业级复式记账工具，实现财务透明化管理',
  favicon: 'img/beancount-trans-logo.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://trans.dhr2333.cn/',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/docs/',
  // baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'dhr2333', // Usually your GitHub org/user name.
  projectName: 'Beancount-Trans', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-CN', // 将默认语言改为中文
    locales: ['zh-CN'], // 支持中文和英文
    // locales: ['zh-CN', 'en'], // 支持中文和英文
    localeConfigs: {
      'zh-CN': {
        label: '简体中文',
        direction: 'ltr',
      },
      // 'en': {
      //   label: 'English',
      //   direction: 'ltr',
      // },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: ({locale, versionDocsDirPath, docPath}) => {
            return `https://github.com/dhr2333/Beancount-Trans/tree/main/Beancount-Trans-Docs/${versionDocsDirPath}/${docPath}?language=${locale}`;
          },
        },
        blog: {
          showReadingTime: true,
          postsPerPage: 20,
          blogSidebarCount: 20,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: ({locale, blogPath}) => {
            return `https://github.com/dhr2333/Beancount-Trans/tree/main/Beancount-Trans-Docs/blog/${blogPath}?language=${locale}`;
          },
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'ignore',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  markdown: {
    mermaid: true,
  },

  themes: ['@docusaurus/theme-mermaid'],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'Beancount-Trans',
      logo: {
        alt: 'Beancount-Trans Logo',
        src: 'img/beancount-trans-logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: '教程',
        },
        {
          to: '/blog',
          position: 'left',
          label: '博客'
        },
        {
          to: 'https://trans.dhr2333.cn/api/redoc/',
          position: 'left',
          label: 'API'
        },
        {
          type: 'localeDropdown', // 添加语言切换下拉菜单
          position: 'right',
        },
        {
          href: 'https://github.com/dhr2333/Beancount-Trans',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '文档',
          items: [
            {
              label: '教程',
              to: '/docs/quick-start',
            },
          ],
        },
        {
          title: '社区',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/docusaurus',
            },
            {
              label: 'Discord',
              href: 'https://discordapp.com/invite/docusaurus',
            },
            {
              label: 'X',
              href: 'https://x.com/docusaurus',
            },
          ],
        },
        {
          title: '更多',
          items: [
            {
              label: '博客',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/dhr2333/Beancount-Trans',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Beancount-Trans`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    metadata: [
      {name: 'keywords', content: 'beancount, 复式记账, 中文文档, 财务工具'}
    ],
    mermaid: {
      theme: { light: 'default', dark: 'dark' }, // 为主题模式指定不同的mermaid主题
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
