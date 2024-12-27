import randomSelection from './utils.js';

let messageTimer: NodeJS.Timeout | null = null;

function showMessage(text: string | string[], timeout: number, priority: number) {
  if (!text || (sessionStorage.getItem('waifu-text') && Number(sessionStorage.getItem('waifu-text')) > priority)) return;
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
