export const toCamelCase = (word: string) =>
  word.replace(/[-_]./g, (match) => match[1].toUpperCase()).replace(/^./, (char) => char.toUpperCase());
