import type { Options } from 'semantic-release';

const config: Options = {
  branches: ['main'],
  repositoryUrl: 'https://github.com/dhr2333/Beancount-Trans-Docs',
  tagFormat: '${version}',
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits'
      }
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits'
      }
    ],
    [
      '@google/semantic-release-replace-plugin',
      {
        replacements: [
          {
            files: ['package.json'],
            pattern: '"version": "[^"]+"',
            replacement: '"version": "${nextRelease.version}"'
          },
          {
            files: ['docs/06-版本更新日志.md'],
            pattern: '## v[^\\n]+',
            replacement: '## v${nextRelease.version}'
          }
        ]
      }
    ],
    [
      '@semantic-release/git',
      {
        assets: [
          'package.json',
          'package-lock.json',
          'docs/06-版本更新日志.md'
        ],
        message:
          'chore(docs): release docs v${nextRelease.version}\n\n${nextRelease.notes}'
      }
    ],
    [
      '@semantic-release/github',
      {
        successComment: false
      }
    ]
  ]
};

export default config;

