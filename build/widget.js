import { ModelManager } from './model.js';
import { showMessage, welcomeMessage } from './message.js';
import { randomSelection } from './utils.js';
import { ToolsManager } from './tools.js';
import logger from './logger.js';
import registerDrag from './drag.js';
import { fa_child } from './icons.js';
function registerEventListener(tips) {
    let userAction = false;
    let userActionTimer;
    const messageArray = tips.message.default;
    tips.seasons.forEach(({ date, text }) => {
        const now = new Date(), after = date.split('-')[0], before = date.split('-')[1] || after;
        if (Number(after.split('/')[0]) <= now.getMonth() + 1 &&
            now.getMonth() + 1 <= Number(before.split('/')[0]) &&
            Number(after.split('/')[1]) <= now.getDate() &&
            now.getDate() <= Number(before.split('/')[1])) {
            text = randomSelection(text);
            text = text.replace('{year}', String(now.getFullYear()));
            messageArray.push(text);
        }
    });
    let lastHoverElement;
    window.addEventListener('mousemove', () => (userAction = true));
    window.addEventListener('keydown', () => (userAction = true));
    setInterval(() => {
        if (userAction) {
            userAction = false;
            clearInterval(userActionTimer);
            userActionTimer = null;
        }
        else if (!userActionTimer) {
            userActionTimer = setInterval(() => {
                showMessage(messageArray, 6000, 9);
            }, 20000);
        }
    }, 1000);
    window.addEventListener('mouseover', (event) => {
        var _b;
        for (let { selector, text } of tips.mouseover) {
            if (!((_b = event.target) === null || _b === void 0 ? void 0 : _b.closest(selector)))
                continue;
            if (lastHoverElement === selector)
                return;
            lastHoverElement = selector;
            text = randomSelection(text);
            text = text.replace('{text}', event.target.innerText);
            showMessage(text, 4000, 8);
            return;
        }
    });
    window.addEventListener('click', (event) => {
        var _b;
        for (let { selector, text } of tips.click) {
            if (!((_b = event.target) === null || _b === void 0 ? void 0 : _b.closest(selector)))
                continue;
            text = randomSelection(text);
            text = text.replace('{text}', event.target.innerText);
            showMessage(text, 4000, 8);
            return;
        }
    });
    window.addEventListener('live2d:hoverbody', () => {
        const text = randomSelection(tips.message.hoverBody);
        showMessage(text, 4000, 8, false);
    });
    window.addEventListener('live2d:tapbody', () => {
        const text = randomSelection(tips.message.tapBody);
        showMessage(text, 4000, 9);
    });
    const devtools = () => { };
    console.log('%c', devtools);
    devtools.toString = () => {
        showMessage(tips.message.console, 6000, 9);
    };
    window.addEventListener('copy', () => {
        showMessage(tips.message.copy, 6000, 9);
    });
    window.addEventListener('visibilitychange', () => {
        if (!document.hidden)
            showMessage(tips.message.visibilitychange, 6000, 9);
    });
}
async function loadWidget(config) {
    var _b;
    localStorage.removeItem('waifu-display');
    sessionStorage.removeItem('waifu-message-priority');
    document.body.insertAdjacentHTML('beforeend', `<div id="waifu">
       <div id="waifu-tips"></div>
       <div id="waifu-canvas">
         <canvas id="live2d" width="800" height="800"></canvas>
       </div>
       <div id="waifu-tool"></div>
     </div>`);
    let models = [];
    let tips;
    if (config.waifuPath) {
        const response = await fetch(config.waifuPath);
        tips = await response.json();
        models = tips.models;
        registerEventListener(tips);
        showMessage(welcomeMessage(tips.time, tips.message.welcome, tips.message.referrer), 7000, 11);
    }
    const model = await ModelManager.initCheck(config, models);
    await model.loadModel('');
    new ToolsManager(model, config, tips).registerTools();
    if (config.drag)
        registerDrag();
    (_b = document.getElementById('waifu')) === null || _b === void 0 ? void 0 : _b.classList.add('waifu-active');
}
function initWidget(config) {
    if (typeof config === 'string') {
        logger.error('Your config for Live2D initWidget is outdated. Please refer to https://github.com/stevenjoezhang/live2d-widget/blob/master/dist/autoload.js');
        return;
    }
    logger.setLevel(config.logLevel);
    document.body.insertAdjacentHTML('beforeend', `<div id="waifu-toggle">
       ${fa_child}
     </div>`);
    const toggle = document.getElementById('waifu-toggle');
    toggle === null || toggle === void 0 ? void 0 : toggle.addEventListener('click', () => {
        var _b;
        toggle === null || toggle === void 0 ? void 0 : toggle.classList.remove('waifu-toggle-active');
        if (toggle === null || toggle === void 0 ? void 0 : toggle.getAttribute('first-time')) {
            loadWidget(config);
            toggle === null || toggle === void 0 ? void 0 : toggle.removeAttribute('first-time');
        }
        else {
            localStorage.removeItem('waifu-display');
            (_b = document.getElementById('waifu')) === null || _b === void 0 ? void 0 : _b.classList.remove('waifu-hidden');
            setTimeout(() => {
                var _b;
                (_b = document.getElementById('waifu')) === null || _b === void 0 ? void 0 : _b.classList.add('waifu-active');
            }, 0);
        }
    });
    if (localStorage.getItem('waifu-display') &&
        Date.now() - Number(localStorage.getItem('waifu-display')) <= 86400000) {
        toggle === null || toggle === void 0 ? void 0 : toggle.setAttribute('first-time', 'true');
        setTimeout(() => {
            toggle === null || toggle === void 0 ? void 0 : toggle.classList.add('waifu-toggle-active');
        }, 0);
    }
    else {
        loadWidget(config);
    }
}
export { initWidget };
