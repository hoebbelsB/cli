import { vol } from 'memfs';
import { unlink } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { formatBytes } from '@code-pushup/utils';
import {
  PluginOptions,
  assertFileSize,
  errorMessage,
  fileSizeIssues,
  infoMessage,
  runnerFunction,
} from './file-size.plugin';

const outputDir = 'test';
const projectJson = JSON.stringify(
  {
    test: 42,
    arr: [1, 2, 3],
    obj: { test: 42 },
  },
  null,
  2,
);
const testJs = `
    const str = 'Hello World'
    const num = 42;
    const obj = ${projectJson};
  `;

describe('infoMessage', () => {
  it.each([['index.js'], [join('src', 'index.js')]])(
    'should return info message',
    file => {
      expect(infoMessage(file, 12)).toBe(
        `File ${basename(file)} is OK. (size: ${formatBytes(12)})`,
      );
    },
  );
});

describe('errorMessage', () => {
  it.each([
    [1, 0],
    [2, 1],
  ])(
    'should return error message for size %i with budget %i',
    (size, budget) => {
      expect(errorMessage('test.js', size, budget)).toBe(
        `File test.js has ${size} B, this is ${1} B too big. (budget: ${budget} B)`,
      );
    },
  );
});

describe('assertFileSize', () => {
  it.each([[-1], [0], [1]])(
    'should return a informative Issue without budgets (size: %s)',
    size => {
      expect(assertFileSize('test.js', size)).toEqual({
        message: infoMessage('test.js', size),
        severity: 'info',
        source: { file: 'test.js' },
      });
    },
  );

  it.each([
    [0, 0],
    [0, 1],
    [1, 1],
  ])(
    'should return a informative Issue with budgets not exceeding (size: %s, budget: %s)',
    (size, budget) => {
      expect(assertFileSize('test.js', size, budget)).toEqual({
        message: infoMessage('test.js', size),
        severity: 'info',
        source: { file: 'test.js' },
      });
    },
  );

  it.each([[1, 0]])(
    'should return error Issue with budgets exceeding (size: %s, budget: %s)',
    (size, budget) => {
      expect(assertFileSize('test.js', size, budget)).toEqual({
        message: errorMessage('test.js', size, budget),
        severity: 'error',
        source: { file: 'test.js' },
      });
    },
  );
});

describe('fileSizeIssues', () => {
  const baseOptions: PluginOptions = {
    directory: '/',
  };

  beforeEach(() => {
    vol.fromJSON(
      {
        'project.json': projectJson,
        'src/test.js': testJs,
        'docs/README.md': '# Docs',
      },
      outputDir,
    );
  });

  it('should list all files', async () => {
    await expect(fileSizeIssues(baseOptions)).resolves.toEqual(
      expect.arrayContaining(
        ['project.json', 'test.js', 'README.md'].map(f => ({
          message: expect.any(String),
          severity: expect.any(String),
          source: {
            file: expect.stringContaining(f),
          },
        })),
      ),
    );
  });

  it('should list files matching a pattern', async () => {
    await expect(
      fileSizeIssues({
        ...baseOptions,
        pattern: /\.js$/,
      }),
    ).resolves.toEqual([
      {
        message: expect.any(String),
        severity: expect.any(String),
        source: {
          file: expect.stringContaining('test.js'),
        },
      },
    ]);
  });

  it('should assert files that are over budget', async () => {
    await expect(
      fileSizeIssues({
        ...baseOptions,
        budget: 25,
      }),
    ).resolves.toEqual(
      expect.arrayContaining([
        {
          message: expect.any(String),
          severity: 'info',
          source: {
            file: expect.stringContaining('README.md'),
          },
        },
        {
          message: expect.any(String),
          severity: 'error',
          source: {
            file: expect.stringContaining('project.json'),
          },
        },
        {
          message: expect.any(String),
          severity: 'error',
          source: {
            file: expect.stringContaining('test.js'),
          },
        },
      ]),
    );
  });

  it('should assert files that are over budget and match the pattern', async () => {
    await expect(
      fileSizeIssues({
        ...baseOptions,
        budget: 1,
        pattern: /\.js$/,
      }),
    ).resolves.toEqual([
      {
        message: expect.any(String),
        severity: 'error',
        source: {
          file: expect.stringContaining('test.js'),
        },
      },
    ]);
  });
});

describe('runnerFunction', () => {
  const baseOptions: PluginOptions = {
    directory: '/',
  };
  const filesizeAuditOutputBase = {
    displayValue: '0 files oversize',
    score: 1,
    slug: 'file-size-check',
    value: 0,
  };

  beforeEach(() => {
    vol.fromJSON(
      {
        'project.json': projectJson,
        'src/test.js': testJs,
      },
      outputDir,
    );
  });

  it('should return pass if no files are given and pass', async () => {
    vol.reset();
    // create empty directory
    vol.fromJSON(
      {
        'm.js': '',
      },
      outputDir,
    );
    await unlink(join(outputDir, 'm.js'));

    await expect(runnerFunction(baseOptions)).resolves.toEqual([
      filesizeAuditOutputBase,
    ]);
  });

  it('should return issues if files are given and pass', async () => {
    await expect(runnerFunction(baseOptions)).resolves.toEqual([
      expect.objectContaining({
        ...filesizeAuditOutputBase,
        details: {
          issues: expect.any(Array),
        },
      }),
    ]);
  });

  it('should have number of files given as value', async () => {
    await expect(runnerFunction(baseOptions)).resolves.toEqual([
      expect.objectContaining({
        displayValue: '0 files oversize',
        value: 0,
      }),
    ]);
  });

  it('should have files in issues that are matching the pattern as issues', async () => {
    await expect(
      runnerFunction({
        ...baseOptions,
        pattern: /\.js$/,
      }),
    ).resolves.toEqual([
      expect.objectContaining({
        details: {
          issues: [
            expect.objectContaining({
              source: {
                file: expect.stringContaining('test.js'),
              },
            }),
          ],
        },
      }),
    ]);
  });

  it('should have number of files that are over budget as value and listed in issues', async () => {
    await expect(
      runnerFunction({
        ...baseOptions,
        budget: 128,
      }),
    ).resolves.toEqual([
      {
        ...filesizeAuditOutputBase,
        displayValue: '1 file oversize',
        value: 1,
        score: expect.any(Number),
        details: {
          issues: expect.arrayContaining([
            {
              message:
                'File test.js has 154 B, this is 26 B too big. (budget: 128 B)',
              severity: 'error',
              source: {
                file: expect.stringContaining('test.js'),
              },
            },
          ]),
        },
      },
    ]);
  });

  it.each([
    [0, 2, 0],
    [128, 1, 0.5],
    [1000, 0, 1],
  ])('should have correct score', async (budget, value, score) => {
    await expect(
      runnerFunction({
        ...baseOptions,
        budget,
      }),
    ).resolves.toEqual([
      {
        ...filesizeAuditOutputBase,
        displayValue: expect.stringContaining(value.toString()),
        value,
        score,
        details: {
          issues: expect.any(Array),
        },
      },
    ]);
  });
});
