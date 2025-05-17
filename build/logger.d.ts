type LogLevel = 'error' | 'warn' | 'info' | 'trace';
declare class Logger {
    private static levelOrder;
    private level;
    constructor(level?: LogLevel);
    setLevel(level: LogLevel | undefined): void;
    private shouldLog;
    error(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    trace(message: string, ...args: any[]): void;
}
declare const logger: Logger;
export default logger;
export { LogLevel };
