import { randomSelection } from './utils.js';
let messageTimer = null;
function showMessage(text, timeout, priority) {
    if (!text ||
        (sessionStorage.getItem('waifu-text') &&
            Number(sessionStorage.getItem('waifu-text')) > priority))
        return;
    if (messageTimer) {
        clearTimeout(messageTimer);
        messageTimer = null;
    }
    text = randomSelection(text);
    sessionStorage.setItem('waifu-text', String(priority));
    const tips = document.getElementById('waifu-tips');
    tips.innerHTML = text;
    tips.classList.add('waifu-tips-active');
    messageTimer = setTimeout(() => {
        sessionStorage.removeItem('waifu-text');
        tips.classList.remove('waifu-tips-active');
    }, timeout);
}
function welcomeMessage(time) {
    if (location.pathname === '/') {
        for (const { hour, text } of time) {
            const now = new Date(), after = hour.split('-')[0], before = hour.split('-')[1] || after;
            if (Number(after) <= now.getHours() &&
                now.getHours() <= Number(before)) {
                return text;
            }
        }
    }
    const text = `欢迎阅读<span>「${document.title.split(' - ')[0]}」</span>`;
    let from;
    if (document.referrer !== '') {
        const referrer = new URL(document.referrer), domain = referrer.hostname.split('.')[1];
        const domains = {
            baidu: '百度',
            so: '360搜索',
            google: '谷歌搜索',
        };
        if (location.hostname === referrer.hostname)
            return text;
        if (domain in domains)
            from = domains[domain];
        else
            from = referrer.hostname;
        return `Hello！来自 <span>${from}</span> 的朋友<br>${text}`;
    }
    return text;
}
export { showMessage, welcomeMessage };
