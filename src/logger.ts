type LogLevel = 'error' | 'warn' | 'info' | 'trace';

class Logger {
  private static levelOrder: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    trace: 3,
  };

  private level: LogLevel;

  constructor(level: LogLevel = 'info') {
    this.level = level;
  }

  setLevel(level: LogLevel) {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return Logger.levelOrder[level] <= Logger.levelOrder[this.level];
  }

  error(message: string, ...args: any[]) {
    if (this.shouldLog('error')) {
      console.error('[Live2d Widget][ERROR]', message, ...args);
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.shouldLog('warn')) {
      console.warn('[Live2d Widget][WARN ]', message, ...args);
    }
  }

  info(message: string, ...args: any[]) {
    if (this.shouldLog('info')) {
      console.log('[Live2d Widget][INFO ]', message, ...args);
    }
  }

  trace(message: string, ...args: any[]) {
    if (this.shouldLog('trace')) {
      console.log('[Live2d Widget][TRACE]', message, ...args);
    }
  }
}

const logger = new Logger();

export default logger;
