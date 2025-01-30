/* eslint-disable max-len */
import chalk from 'chalk';
import { globSync } from 'glob';
import minimist from 'minimist';
import { realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { cwd } from 'node:process';
import { logger } from './logger';

function printIntro() {
  logger.log(
    `
This program will find all svg files in the given folder and strip the contents
of each file from invalid attributes and, where possible, attribute values will be
converted to props (eg. \`style="..."\`).
New (component) files will be stored in the folder containing the original svg files
with their file names transformed (from snake, kebab or camel) to PascalCase.`,
    false,
  );
}

function printHowTo() {
  logger.log(
    `
${chalk.white(`${chalk.bold('Usage:')}
  node bin/svgToReact/convertSvgToReact.js --sourceFolder=<folder> [--sourceFolder=<folder>] [--excludeFolder=<folder>]`)}\n
  Please provide at least one source folder with the --sourceFolder flag.\n`,
    false,
  );

  process.exit(0);
}

export async function getFiles() {
  const { sourceFolder = '', excludeFolder = '' } = minimist(process.argv.slice(2));

  if (typeof sourceFolder !== 'string' && Array.isArray(sourceFolder) === false) {
    printHowTo();
  }

  printIntro();

  const sourceFolders: Array<string> = (typeof sourceFolder === 'string' ? [sourceFolder] : sourceFolder).filter(
    Boolean,
  );

  if (!sourceFolders.length) {
    printHowTo();
    process.exit(0);
  }

  logger.log(
    `\n
${excludeFolder ? chalk.yellow(`Ignoring files in ${excludeFolder}`) : ''}
`,
    false,
  );

  const filesToConvert = sourceFolders.flatMap((sourceFolder) => {
    const basePath = resolve(cwd(), sourceFolder);

    try {
      realpathSync(basePath);
      logger.log(`${chalk.white(`Converting files in ${basePath}`)}\n`, false);
    } catch {
      logger.fatal(`Invalid source folder: ${sourceFolder}\n`);
      process.exit(1);
    }

    const ignore = excludeFolder ? resolve(cwd(), excludeFolder) + '/**' : '';
    const svgFiles = globSync(`${sourceFolder}/**/*.svg`, { ignore });

    return svgFiles;
  });

  if (!filesToConvert.length) {
    logger.info(chalk.green(`No SVG files found in ${sourceFolders.join(', ')}\n`));
    process.exit(0);
  }

  return filesToConvert;
}
