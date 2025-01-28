import { writeFileSync } from 'node:fs';
import { parse } from 'node:path';
import { logger } from './logger';

export function storeFile(filePath: string, data: string) {
  const { name, ext } = parse(filePath);
  logger.log(`  Writing ${name}${ext}`);
  writeFileSync(filePath, data);
  logger.lineSuccess();
}
