import { readFileSync, writeFileSync } from 'node:fs';

export function prependToFile(filePath: string, contents: string) {
  const original = readFileSync(filePath).toString();
  const newContent = `${contents}
${original}`;
  writeFileSync(filePath, newContent);
}
