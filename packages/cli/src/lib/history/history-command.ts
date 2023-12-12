import chalk from 'chalk';
import { CommandModule } from 'yargs';
import { HistoryOptions, history } from '@code-pushup/core';
import { CLI_NAME } from '../cli';

export function yargsHistoryCommandObject() {
  const command = 'history';
  return {
    command,
    describe: 'Create history of commits',
    handler: async args => {
      // eslint-disable-next-line no-console
      console.log(chalk.bold(CLI_NAME));
      // eslint-disable-next-line no-console
      console.log(chalk.gray(`Run ${command}...`));
      const config = args as unknown as HistoryOptions;

      await history({
        ...config,
        targetBranch: 'main',
      });
    },
  } satisfies CommandModule;
}