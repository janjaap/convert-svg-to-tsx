import { readFileSync, unlinkSync } from 'node:fs';

import { execSync } from 'node:child_process';
import { getFiles } from './lib/getFiles';
import { getOptimizedSvg } from './lib/getOptimizedSvg';
import { lint } from './lib/lint';
import { logger } from './lib/logger';
import { prettify } from './lib/prettify';
import { promptForInput } from './lib/promptForInput';
import { replaceReferences } from './lib/replaceReferences';
import { storeFile } from './lib/storeFile';

// clear the terminal window
process.stdout.write('\x1Bc');

let canLint = true;

void (async () => {
  // 1. Find all SVG files
  const svgFilesInSourceFolders = await getFiles();

  const {
    numberOfFilesToProcess,
    replaceAllReferences,
    removeAllSourceFiles,
    eslintFix,
    prettierWrite,
  } = await promptForInput(svgFilesInSourceFolders.length);

  if (eslintFix) {
    try {
      execSync('npx eslint --inspect-config', { stdio: 'ignore' });
    } catch (error: any) {
      logger.error('  ESLint is not installed', false);
      canLint = false;
    }
  }

  const filesToConvert = svgFilesInSourceFolders.slice(
    0,
    numberOfFilesToProcess,
  );

  const longestFileName = filesToConvert.reduce(
    (acc, file) => (file.length > acc ? file.length : acc),
    0,
  );
  const numberOfFilesToConvert = filesToConvert.length;

  const getFileCounter = (index: number) =>
    `${index
      .toString()
      .padStart(
        numberOfFilesToConvert.toString().length,
        ' ',
      )}/${numberOfFilesToConvert}`;

  const getProgress = (index: number) =>
    ((index / numberOfFilesToConvert) * 100).toFixed(1);

  filesToConvert.forEach((filePath, index) => {
    const currentFileIndex = index + 1;
    const fileCounter = getFileCounter(currentFileIndex);
    const progress = getProgress(currentFileIndex);
    const headerParts = [
      `${filePath}`,
      ''.padStart(longestFileName + 10 - filePath.length, '.'), // aligns the progress counter
      `(${fileCounter}) ${progress.padStart(5, ' ')}%`,
      '\n',
    ];
    const header = headerParts.join(' ');
    logger.info(header, false);

    let data: string;

    try {
      data = readFileSync(filePath, 'utf8');
    } catch (readEror: any) {
      if (readEror) {
        logger.error(
          `  Cannot read file. ${filePath} needs to be converted manually.`,
        );
        return;
      }
    }

    // 2. Map the original file data to a React component template
    const { content, componentFilePath, filename } = getOptimizedSvg(
      filePath,
      data!,
    );

    // 3. Store the new React component
    try {
      storeFile(componentFilePath, content);
    } catch {
      logger.error(`  Could not write\n`);
      return;
    }

    if (prettierWrite) {
      // 4. Format new file with Prettier
      try {
        prettify(componentFilePath);
      } catch (prettifyError: any) {
        console.log(prettifyError);
        logger.error(`  Could not prettify\n`);
      }
    }

    if (canLint && eslintFix) {
      // 5. Fix linter issues
      lint(componentFilePath);
    }

    if (replaceAllReferences) {
      // 6. Find all file references and replace them with the new file
      replaceReferences(filePath, componentFilePath);

      // 7. Remove original file
      if (removeAllSourceFiles) {
        try {
          logger.log(`  Removing ${filePath}`);
          unlinkSync(filePath);
          logger.lineSuccess();
        } catch {
          logger.error(`  Could not remove ${filePath}\n`);
        }
      }
    }

    logger.summary(header.length, filename);
  });

  process.exit(0);
})();
