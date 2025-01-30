import chalk from 'chalk';
import { createInterface } from 'readline';
import { logger } from './logger';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const prompt = (query: string) => new Promise<string>((resolve) => rl.question(query, resolve));

const questionConfirmed = (answer: string) => answer.toLowerCase() === 'y' || answer === '';
const getResponse = async (query: string, defaultValue: string) => {
  const answerPrompt = prompt(chalk.blueBright(query + ' '));

  rl.write(defaultValue);

  return (await answerPrompt).trim();
};

type PromptReturn = {
  numberOfFilesToProcess: number;
  replaceAllReferences: boolean;
  removeAllSourceFiles: boolean;
};

export const promptForInput = async (numberOfFileCandidates: number) => {
  try {
    const length = numberOfFileCandidates.toString();

    {
      const answer = await getResponse(`Found ${length} files. Continue? (Y/n)`, 'Y');

      if (!questionConfirmed(answer)) {
        rl.close();
        process.exit(0);
      }
    }

    const promptReturn: PromptReturn = {
      numberOfFilesToProcess: numberOfFileCandidates,
      replaceAllReferences: true,
      removeAllSourceFiles: true,
    };

    {
      const answer = await getResponse(`How many files do you want to convert? [${length}]`, length);
      const processAmount = parseInt(answer, 10);

      if (!isNaN(processAmount)) {
        promptReturn.numberOfFilesToProcess =
          processAmount > numberOfFileCandidates ? numberOfFileCandidates : processAmount;
      }
    }

    {
      const answer = await getResponse(`Replace all references in import statements? (Y/n)`, 'Y');
      promptReturn.replaceAllReferences = questionConfirmed(answer);
    }

    {
      const answer = await getResponse(`Remove all source files? (Y/n)`, 'Y');
      promptReturn.removeAllSourceFiles = questionConfirmed(answer);
    }

    rl.close();
    return promptReturn;
  } catch (promptError: any) {
    logger.fatal(promptError.message);
    rl.close();
    process.exit(1);
  }
};
