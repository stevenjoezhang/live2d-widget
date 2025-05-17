var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var Logger = (function () {
    function Logger(level) {
        if (level === void 0) { level = 'info'; }
        this.level = level;
    }
    Logger.prototype.setLevel = function (level) {
        if (!level)
            return;
        this.level = level;
    };
    Logger.prototype.shouldLog = function (level) {
        return Logger.levelOrder[level] <= Logger.levelOrder[this.level];
    };
    Logger.prototype.error = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.shouldLog('error')) {
            console.error.apply(console, __spreadArray(['[Live2d Widget][ERROR]', message], args, false));
        }
    };
    Logger.prototype.warn = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.shouldLog('warn')) {
            console.warn.apply(console, __spreadArray(['[Live2d Widget][WARN ]', message], args, false));
        }
    };
    Logger.prototype.info = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.shouldLog('info')) {
            console.log.apply(console, __spreadArray(['[Live2d Widget][INFO ]', message], args, false));
        }
    };
    Logger.prototype.trace = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.shouldLog('trace')) {
            console.log.apply(console, __spreadArray(['[Live2d Widget][TRACE]', message], args, false));
        }
    };
    Logger.levelOrder = {
        error: 0,
        warn: 1,
        info: 2,
        trace: 3,
    };
    return Logger;
}());
var logger = new Logger();
export default logger;
