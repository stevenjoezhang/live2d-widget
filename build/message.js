import { randomSelection } from './utils.js';
let messageTimer = null;
function showMessage(text, timeout, priority, override = true) {
    let currentPriority = parseInt(sessionStorage.getItem('waifu-message-priority'), 10);
    if (isNaN(currentPriority)) {
        currentPriority = 0;
    }
    if (!text ||
        (override && currentPriority > priority) ||
        (!override && currentPriority >= priority))
        return;
    if (messageTimer) {
        clearTimeout(messageTimer);
        messageTimer = null;
    }
    text = randomSelection(text);
    sessionStorage.setItem('waifu-message-priority', String(priority));
    const tips = document.getElementById('waifu-tips');
    tips.innerHTML = text;
    tips.classList.add('waifu-tips-active');
    messageTimer = setTimeout(() => {
        sessionStorage.removeItem('waifu-message-priority');
        tips.classList.remove('waifu-tips-active');
    }, timeout);
}
function welcomeMessage(time, welcomeTemplate, referrerTemplate) {
    if (location.pathname === '/') {
        for (const { hour, text } of time) {
            const now = new Date(), after = hour.split('-')[0], before = hour.split('-')[1] || after;
            if (Number(after) <= now.getHours() &&
                now.getHours() <= Number(before)) {
                return text;
            }
        }
    }
    const text = i18n(welcomeTemplate, document.title);
    if (document.referrer !== '') {
        const referrer = new URL(document.referrer);
        if (location.hostname === referrer.hostname)
            return text;
        return `${i18n(referrerTemplate, referrer.hostname)}<br>${text}`;
    }
    return text;
}
function i18n(template, ...args) {
    return template.replace(/\$(\d+)/g, (_, idx) => {
        var _b;
        const i = parseInt(idx, 10) - 1;
        return (_b = args[i]) !== null && _b !== void 0 ? _b : '';
    });
}
export { showMessage, welcomeMessage, i18n };
