import { randomSelection } from './utils.js';
var messageTimer = null;
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
    var tips = document.getElementById('waifu-tips');
    tips.innerHTML = text;
    tips.classList.add('waifu-tips-active');
    messageTimer = setTimeout(function () {
        sessionStorage.removeItem('waifu-text');
        tips.classList.remove('waifu-tips-active');
    }, timeout);
}
function welcomeMessage(time) {
    if (location.pathname === '/') {
        for (var _i = 0, time_1 = time; _i < time_1.length; _i++) {
            var _a = time_1[_i], hour = _a.hour, text_1 = _a.text;
            var now = new Date(), after = hour.split('-')[0], before = hour.split('-')[1] || after;
            if (Number(after) <= now.getHours() &&
                now.getHours() <= Number(before)) {
                return text_1;
            }
        }
    }
    var text = "\u6B22\u8FCE\u9605\u8BFB<span>\u300C".concat(document.title.split(' - ')[0], "\u300D</span>");
    var from;
    if (document.referrer !== '') {
        var referrer = new URL(document.referrer), domain = referrer.hostname.split('.')[1];
        var domains = {
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
        return "Hello\uFF01\u6765\u81EA <span>".concat(from, "</span> \u7684\u670B\u53CB<br>").concat(text);
    }
    return text;
}
export { showMessage, welcomeMessage };
