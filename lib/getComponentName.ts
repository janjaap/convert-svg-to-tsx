import { parse } from 'node:path';
import { toCamelCase } from './toCamelCase';

export const getComponentName = (filePath: string) => {
  const { name } = parse(filePath);
  // Check if the name starts with a number. if it does, prefix it with 'svg';
  // React component names cannot start with a number.
  return toCamelCase(name.match(/^\d/) ? `svg${name}` : name);
};
