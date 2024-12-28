/**
 * @file 包含显示看板娘消息的函数。
 * @module message
 */

import randomSelection from './utils.js';

let messageTimer: NodeJS.Timeout | null = null;

/**
 * 显示看板娘消息。
 * @param {string | string[]} text - 消息文本或文本数组。
 * @param {number} timeout - 消息显示的超时时间（毫秒）。
 * @param {number} priority - 消息的优先级。
 */
function showMessage(
  text: string | string[],
  timeout: number,
  priority: number,
) {
  if (
    !text ||
    (sessionStorage.getItem('waifu-text') &&
      Number(sessionStorage.getItem('waifu-text')) > priority)
  )
    return;
  if (messageTimer) {
    clearTimeout(messageTimer);
    messageTimer = null;
  }
  text = randomSelection(text) as string;
  sessionStorage.setItem('waifu-text', String(priority));
  const tips = document.getElementById('waifu-tips')!;
  tips.innerHTML = text;
  tips.classList.add('waifu-tips-active');
  messageTimer = setTimeout(() => {
    sessionStorage.removeItem('waifu-text');
    tips.classList.remove('waifu-tips-active');
  }, timeout);
}

export default showMessage;
