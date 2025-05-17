/**
 * @file 包含显示看板娘消息的函数。
 * @module message
 */

import { randomSelection } from './utils.js';

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

/**
 * 根据时间显示欢迎消息。
 * @param {Time} time - 时间消息配置。
 * @returns {string} 欢迎消息。
 */
function welcomeMessage(time: Time): string {
  if (location.pathname === '/') {
    // 如果是主页
    for (const { hour, text } of time) {
      const now = new Date(),
        after = hour.split('-')[0],
        before = hour.split('-')[1] || after;
      if (
        Number(after) <= now.getHours() &&
        now.getHours() <= Number(before)
      ) {
        return text;
      }
    }
  }
  const text = `欢迎阅读<span>「${document.title.split(' - ')[0]}」</span>`;
  let from;
  if (document.referrer !== '') {
    const referrer = new URL(document.referrer),
      domain = referrer.hostname.split('.')[1];
    const domains = {
      baidu: '百度',
      so: '360搜索',
      google: '谷歌搜索',
    } as const;
    if (location.hostname === referrer.hostname) return text;

    if (domain in domains) from = domains[domain as keyof typeof domains];
    else from = referrer.hostname;
    return `Hello！来自 <span>${from}</span> 的朋友<br>${text}`;
  }
  return text;
}

export { showMessage, welcomeMessage };
