import { eslintPlugin } from './eslint-plugin';

describe('eslintPlugin', () => {
  it('should initialize ESLint plugin', () => {
    expect(eslintPlugin({ config: '.eslintrc.json' })).toEqual({
      name: 'eslint',
      version: '8.46.0',
    });
  });
});