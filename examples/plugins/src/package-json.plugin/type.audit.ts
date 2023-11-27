import { AuditOutput, Issue } from '../../../../packages/models/src';
import { PackageJson, SourceResults } from './types';
import {
  displayValueNumPackages,
  findLineNumberInText,
  scoreErrorIssues,
} from './utils';

const typeAuditSlug = 'package-type-check';
export const typeAuditInfoMeta = {
  slug: typeAuditSlug,
  title: 'Type',
  description: 'A audit to check NPM package type`.',
};

export async function typeAudit(
  packageJsonContents: SourceResults,
  type: string | null = null,
): Promise<AuditOutput> {
  const typeAuditOutput: AuditOutput = {
    slug: typeAuditSlug,
    score: 1,
    value: 0,
    displayValue: displayValueNumPackages(0),
  };

  if (!type) {
    return {
      ...typeAuditOutput,
      displayValue: `No type required`,
    };
  }

  const issues = packageJsonContents.map(({ file, json, content }) => {
    const issue: Issue = {
      message: `Type is ${json.type}`,
      severity: 'info',
      source: {
        file,
      },
    };

    if (json.type === undefined) {
      issue.severity = 'error';
      issue.message = 'Type missing';
    }

    let startLine: number | null = null;
    if (json.type === ('' as PackageJson['type'])) {
      startLine = startLine || (findLineNumberInText(content, '"type":') as number);
      issue.severity = 'error';
      issue.message = `Type empty`;
      issue.source = {
        file,
        position: {
          startLine,
        },
      };
    }
    if (json.type === type) {
      startLine = startLine || (findLineNumberInText(content, '"type":') as number);
      issue.severity = 'error';
      issue.message = `Type ${json.type} should be ${type}`;
      issue.source = {
        file,
        position: {
          startLine,
        },
      };
    }

    return issue;
  });

  if (issues.length === 0) {
    return typeAuditOutput;
  }

  const errorCount = issues.filter(
    ({ severity }) => severity === 'error',
  ).length;
  return {
    ...typeAuditOutput,
    value: errorCount,
    displayValue: displayValueNumPackages(errorCount),
    score: scoreErrorIssues(issues),
    details: {
      issues,
    },
  };
}
