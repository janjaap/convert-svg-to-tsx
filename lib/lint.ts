import chalk from 'chalk';
import { execSync } from 'node:child_process';
import { logger } from './logger';
import { prependToFile } from './prependToFile';
import { prettify } from './prettify';

export function lint(filePath: string) {
  logger.log(`  Linting`);

  try {
    execSync(`npx eslint ${filePath} --fix`);
    logger.lineSuccess();
  } catch (error: any) {
    const lintOutput = error.stdout.toString();
    const rules = new Set(
      (lintOutput.match(/(?:\s{2,})([a-z@/-]+)\s*$/gm) ?? []).map((rule: string) => rule.trim().replace('\n', '')),
    );
    const rulesStr = [...rules].join(', ');

    logger.warn(
      `  Could not fix all lint issues. Ignoring rule${rules.size > 1 ? 's' : ''} ${chalk.italic(rulesStr)}.`,
      false,
    );

    try {
      prependToFile(filePath, `/* eslint-disable ${rulesStr} */`);
    } catch {
      logger.error(`  Could not ignore rules\n`);
    }

    try {
      prettify(filePath);
    } catch {
      logger.error(`  Could not prettify after ignoring rules\n`);
    }
  }
}
