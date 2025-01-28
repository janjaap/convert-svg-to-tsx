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

export async function getFiles() {
  const { baseFolder = '', excludeFolder = '' } = minimist(process.argv.slice(2));

  printIntro();

  if (!baseFolder) {
    logger.log(
      `\n
${chalk.white(`${chalk.bold('Usage:')}
  node bin/svgToReact/convertSvgToReact.js --baseFolder=<folder> [--excludeFolder=<folder>]`)}\n
  Please provide a base folder with the --baseFolder flag.\n`,
      false,
    );
    process.exit(0);
  }

  const basePath = resolve(cwd(), baseFolder);

  try {
    realpathSync(basePath);
    logger.log(
      `
${chalk.white(`\nConverting files from ${basePath}
${excludeFolder ? chalk.yellow(`Ignoring files from ${excludeFolder}`) : ''}`)}\n
`,
      false,
    );
  } catch {
    logger.fatal(`Invalid base folder: ${baseFolder}\n`);
    process.exit(1);
  }

  const ignore = excludeFolder ? resolve(cwd(), excludeFolder) + '/**' : '';
  const svgFiles = globSync(`${baseFolder}/**/*.svg`, { ignore });

  if (!svgFiles.length) {
    logger.info(chalk.green(`No SVG files found in ${baseFolder}\n`));
    process.exit(0);
  }

  return svgFiles;
}
