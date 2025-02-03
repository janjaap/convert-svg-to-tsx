import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { getComponentName } from './getComponentName';
import { getSourceFolders } from './getSourceFolders';
import { logger } from './logger';

export const replaceReferences = (
  originalFilePath: string,
  newFilePath: string,
) => {
  const sourceFolders = getSourceFolders();
  const grepRe = /^(.+):.+from '(.+)';$/;
  const fileName = originalFilePath.split('/').pop();

  try {
    /** A list of files that contain an import statement for originalFilePath */
    const filesContainingReferences = execSync(
      `grep -r "${fileName}" ${sourceFolders.join(' ')}`,
    )
      .toString()
      .split('\n')
      .map((line) => line.match(grepRe))
      .filter((match) => {
        if (!match) return false;

        const [, fileContainingReference, importPath] = match;
        const { dir } = path.parse(fileContainingReference);
        const targetPath = path.join(dir, importPath);

        // only include files that contain an exact import reference to the file we need to replace
        return targetPath === originalFilePath;
      }) as Array<RegExpMatchArray>;
    const numReferences = filesContainingReferences.length;

    if (!numReferences) return;

    logger.log(
      `  Replacing references in ${numReferences} ${
        numReferences === 1 ? 'file' : 'files'
      }`,
    );

    filesContainingReferences.forEach(
      ([, fileContainingReference, importPath]) => {
        const { dir: sourceDir } = path.parse(fileContainingReference);
        const search = new RegExp(
          `import { ReactComponent as (.+) } from '${importPath}';`,
        );

        const data = readFileSync(fileContainingReference, 'utf8').toString();
        const [, component] = data.match(search) ?? [];

        if (!component) return;

        const componentName = getComponentName(newFilePath);

        const { dir, name } = path.parse(path.relative(sourceDir, newFilePath));
        const replace = `import { ${componentName} as ${component} } from '${
          dir || '.'
        }/${name}';`;
        const newData = data.replace(search, replace);

        try {
          writeFileSync(fileContainingReference, newData);
        } catch (storeError: any) {
          logger.error(storeError.message);
        }
      },
    );

    logger.lineSuccess();
  } catch (grepError: any) {
    logger.error(grepError.message);
  }
};
