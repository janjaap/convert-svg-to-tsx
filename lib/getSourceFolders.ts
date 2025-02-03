import minimist from 'minimist';

export function getSourceFolders() {
  const { sourceFolder = '' } = minimist(process.argv.slice(2));

  if (
    typeof sourceFolder !== 'string' &&
    Array.isArray(sourceFolder) === false
  ) {
    throw new Error('Invalid source folder');
  }

  const sourceFolders: Array<string> = (
    typeof sourceFolder === 'string' ? [sourceFolder] : sourceFolder
  ).filter(Boolean);

  if (!sourceFolders.length) {
    throw new Error('No source folders found');
  }

  return sourceFolders;
}
