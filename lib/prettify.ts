import { execSync } from 'node:child_process';
import { logger } from './logger';

export function prettify(filePath: string) {
  logger.log('  Prettifying');
  execSync(`npx prettier ${filePath} --write --log-level=error`);
  logger.lineSuccess();
}
