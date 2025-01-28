import chalk from 'chalk';
import process from 'node:process';

export enum Log {
  ERROR = 'error',
  FATAL = 'fatal',
  INFO = 'info',
  LOG = 'log',
  WARN = 'warn',
}

const icons = {
  warning: '⚠',
  error: '✖️',
  success: '✔',
};

function Logger() {
  const errors: Array<string> = [];
  const warnings: Array<string> = [];
  const messages: Array<string> = [];

  const reset = () => {
    messages.length = 0;
    errors.length = 0;
    warnings.length = 0;
  };

  const summary = (printOffset: number, filename: string, resetAfter = true) => {
    const numErrors = getNumErrors();
    const numWarnings = getNumWarnings();

    let summary = '';

    const errorsWarnings = [
      numErrors > 0 ? getError(`${numErrors} ${numErrors === 1 ? 'error' : 'errors'}`) : '',
      numWarnings > 0 ? getWarning(`${numWarnings} ${numWarnings === 1 ? 'warning' : 'warnings'}`) : '',
    ].filter(Boolean);

    summary += errorsWarnings.join(', ');

    if (!errorsWarnings.length) {
      summary = getInfo(icons.success) + summary;
    }

    summary = getLog(filename + ' → ') + summary;

    process.stdout.moveCursor(printOffset, -(messages.length + 1));
    process.stdout.write(`${summary}\n`);
    process.stdout.clearScreenDown();
    process.stdout.cursorTo(0);

    if (resetAfter) {
      reset();
    }
  };

  const pushMessage = (message: string) => {
    messages.push(message);
  };

  function log(message: string): void;
  function log(message: string, type: Log): void;
  function log(message: string, recordForTrace: boolean): void;
  function log(message: string, type: Log, recordForTrace: boolean): void;
  function log(message: string, typeOrRecord?: Log | boolean, recordForTrace?: boolean): void {
    let type = Log.LOG;
    let doRecord = true;

    if (typeOrRecord !== undefined) {
      if (typeof typeOrRecord === 'boolean') {
        doRecord = typeOrRecord;
      } else {
        type = typeOrRecord;
      }
    }

    if (recordForTrace !== undefined) {
      doRecord = recordForTrace;
    }

    if (doRecord) pushMessage(message);

    process.stdout.ref();

    switch (type) {
      case Log.INFO:
        process.stdout.write(getInfo(message));
        break;
      case Log.WARN:
        warnings.push(message);
        process.stdout.write(getWarning(message));
        break;
      case Log.ERROR:
        errors.push(message);
        process.stdout.write(getError(message));
        break;
      case Log.FATAL:
        process.stdout.write(chalk.redBright(message));
        break;
      case Log.LOG:
      default:
        process.stdout.write(getLog(message));
        break;
    }

    process.stdout.unref();
  }

  const getLog = (message: string) => chalk.grey(message);

  const getInfo = (message: string) => chalk.green(message);

  const getWarning = (message: string) => chalk.yellow(message);

  const getError = (message: string) => chalk.red(message);

  const warn = (message: string, record = false) => {
    log(message, Log.WARN, record);
    lineWarning();
  };

  const info = (message: string, record = false) => {
    log(message, Log.INFO, record);
  };

  const error = (message: string, record = false) => {
    log(message, Log.ERROR, record);
    lineError();
  };

  const fatal = (message: string, record = false) => {
    log(message, Log.FATAL, record);
  };

  const prepend = (message: string) => {
    process.stdout.ref();
    process.stdout.cursorTo(0);
    process.stdout.write(message);
    process.stdout.write('\n');
    process.stdout.unref();
  };

  const lineSuccess = () => {
    prepend(chalk.greenBright(icons.success));
  };

  const lineWarning = () => {
    prepend(chalk.yellow(icons.warning));
  };

  const lineError = () => {
    prepend(chalk.red(icons.error));
  };

  const getNumErrors = () => errors.length;
  const getNumWarnings = () => warnings.length;

  return {
    error,
    fatal,
    info,
    lineError,
    lineSuccess,
    lineWarning,
    log,
    summary,
    warn,
  };
}

export const logger = Logger();
