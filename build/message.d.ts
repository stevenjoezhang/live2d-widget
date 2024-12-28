/**
 * @file 包含显示看板娘消息的函数。
 * @module message
 */
/**
 * 显示看板娘消息。
 * @param {string | string[]} text - 消息文本或文本数组。
 * @param {number} timeout - 消息显示的超时时间（毫秒）。
 * @param {number} priority - 消息的优先级。
 */
declare function showMessage(text: string | string[], timeout: number, priority: number): void;
export default showMessage;
