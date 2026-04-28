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
          }
        ]
      }
    ],
    [
      '@semantic-release/git',
      {
        assets: ['package.json', 'package-lock.json'],
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

