import {describe, expect, it} from 'vitest';
import {packageResult,} from '../../../mocks/constants';
import {licenseAudit,} from './license.audit';


describe('licenseAudit', () => {
  it('should pass if not configured', () => {
    expect(
      licenseAudit([packageResult({
        license: 'MIT'
      })], undefined),
    ).toEqual({
      "displayValue": "No license required",
      "score": 1,
      "slug": "package-license",
      "value": 0,
    });
  });

  it.each([
    [undefined],
    ['']
  ])('should error for %s', (license) => {
    const targetPackageJson = license ? {
      license
    } : {};
    expect(
      licenseAudit([packageResult(targetPackageJson)], 'ANY-LICENSE')
    ).toEqual({
      displayValue: "1 package",
      score: 0,
      slug: "package-license",
      value: 1,
      details: {
        issues: [
          {
            message: `license should be ANY-LICENSE but is ${license || 'undefined'}`,
            severity: "error",
            source: {
              file: "package.json",
              position: {
                startLine: null,
              },
            }
          }
        ]
      }
    });
  });

  it('should error for different license', () => {
    const targetPackageJson = {
      license: 'WTF'
    };
    expect(
      licenseAudit([packageResult(targetPackageJson)], 'MIT')
    ).toEqual({
      displayValue: "1 package",
      score: 0,
      slug: "package-license",
      value: 1,
      details: {
        issues: [
          {
            message: `license should be MIT but is ${targetPackageJson.license}`,
            severity: "error",
            source: {
              file: "package.json",
              position: {
                startLine: 1,
              },
            }
          }
        ]
      }
    })
    ;
  });

});
