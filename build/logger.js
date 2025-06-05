class Logger {
    constructor(level = 'info') {
        this.level = level;
    }
    setLevel(level) {
        if (!level)
            return;
        this.level = level;
    }
    shouldLog(level) {
        return Logger.levelOrder[level] <= Logger.levelOrder[this.level];
    }
    error(message, ...args) {
        if (this.shouldLog('error')) {
            console.error('[Live2D Widget][ERROR]', message, ...args);
        }
    }
    warn(message, ...args) {
        if (this.shouldLog('warn')) {
            console.warn('[Live2D Widget][WARN]', message, ...args);
        }
    }
    info(message, ...args) {
        if (this.shouldLog('info')) {
            console.log('[Live2D Widget][INFO]', message, ...args);
        }
    }
    trace(message, ...args) {
        if (this.shouldLog('trace')) {
            console.log('[Live2D Widget][TRACE]', message, ...args);
        }
    }
}
Logger.levelOrder = {
    error: 0,
    warn: 1,
    info: 2,
    trace: 3,
};
const logger = new Logger();
export default logger;
