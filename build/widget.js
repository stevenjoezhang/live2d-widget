var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { ModelManager } from './model.js';
import { showMessage, welcomeMessage } from './message.js';
import { randomSelection } from './utils.js';
import tools from './tools.js';
import logger from './logger.js';
import registerDrag from './drag.js';
function registerTools(model, config) {
    tools['switch-model'].callback = function () { return model.loadNextModel(); };
    tools['switch-texture'].callback = function () { return model.loadRandTexture(); };
    if (!Array.isArray(config.tools)) {
        config.tools = Object.keys(tools);
    }
    for (var _i = 0, _a = config.tools; _i < _a.length; _i++) {
        var tool = _a[_i];
        if (tools[tool]) {
            var _b = tools[tool], icon = _b.icon, callback = _b.callback;
            document
                .getElementById('waifu-tool')
                .insertAdjacentHTML('beforeend', "<span id=\"waifu-tool-".concat(tool, "\">").concat(icon, "</span>"));
            document
                .getElementById("waifu-tool-".concat(tool))
                .addEventListener('click', callback);
        }
    }
}
function registerEventListener(tips) {
    var userAction = false;
    var userActionTimer;
    var messageArray = tips.message.default;
    var lastHoverElement;
    window.addEventListener('mousemove', function () { return (userAction = true); });
    window.addEventListener('keydown', function () { return (userAction = true); });
    setInterval(function () {
        if (userAction) {
            userAction = false;
            clearInterval(userActionTimer);
            userActionTimer = null;
        }
        else if (!userActionTimer) {
            userActionTimer = setInterval(function () {
                showMessage(randomSelection(messageArray), 6000, 9);
            }, 20000);
        }
    }, 1000);
    showMessage(welcomeMessage(tips.time), 7000, 11);
    window.addEventListener('mouseover', function (event) {
        var _a;
        for (var _i = 0, _b = tips.mouseover; _i < _b.length; _i++) {
            var _c = _b[_i], selector = _c.selector, text = _c.text;
            if (!((_a = event.target) === null || _a === void 0 ? void 0 : _a.closest(selector)))
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
    window.addEventListener('click', function (event) {
        var _a;
        for (var _i = 0, _b = tips.click; _i < _b.length; _i++) {
            var _c = _b[_i], selector = _c.selector, text = _c.text;
            if (!((_a = event.target) === null || _a === void 0 ? void 0 : _a.closest(selector)))
                continue;
            text = randomSelection(text);
            text = text.replace('{text}', event.target.innerText);
            showMessage(text, 4000, 8);
            return;
        }
    });
    tips.seasons.forEach(function (_a) {
        var date = _a.date, text = _a.text;
        var now = new Date(), after = date.split('-')[0], before = date.split('-')[1] || after;
        if (Number(after.split('/')[0]) <= now.getMonth() + 1 &&
            now.getMonth() + 1 <= Number(before.split('/')[0]) &&
            Number(after.split('/')[1]) <= now.getDate() &&
            now.getDate() <= Number(before.split('/')[1])) {
            text = randomSelection(text);
            text = text.replace('{year}', String(now.getFullYear()));
            messageArray.push(text);
        }
    });
    var devtools = function () { };
    console.log('%c', devtools);
    devtools.toString = function () {
        showMessage(tips.message.console, 6000, 9);
    };
    window.addEventListener('copy', function () {
        showMessage(tips.message.copy, 6000, 9);
    });
    window.addEventListener('visibilitychange', function () {
        if (!document.hidden)
            showMessage(tips.message.visibilitychange, 6000, 9);
    });
}
function loadWidget(config) {
    return __awaiter(this, void 0, void 0, function () {
        var model, response, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    localStorage.removeItem('waifu-display');
                    sessionStorage.removeItem('waifu-text');
                    document.body.insertAdjacentHTML('beforeend', "<div id=\"waifu\">\n       <div id=\"waifu-tips\"></div>\n       <canvas id=\"live2d\" width=\"800\" height=\"800\"></canvas>\n       <div id=\"waifu-tool\"></div>\n     </div>");
                    model = new ModelManager(config);
                    return [4, model.loadModel('')];
                case 1:
                    _a.sent();
                    registerTools(model, config);
                    if (config.drag)
                        registerDrag();
                    if (!config.waifuPath) return [3, 4];
                    return [4, fetch(config.waifuPath)];
                case 2:
                    response = _a.sent();
                    return [4, response.json()];
                case 3:
                    result = _a.sent();
                    registerEventListener(result);
                    _a.label = 4;
                case 4:
                    document.getElementById('waifu').style.bottom = '0';
                    return [2];
            }
        });
    });
}
function initWidget(config) {
    if (typeof config === 'string') {
        logger.error('Your config for Live2d initWidget is outdated. Please refer to https://github.com/stevenjoezhang/live2d-widget/blob/master/dist/autoload.js');
        return;
    }
    logger.setLevel(config.logLevel);
    document.body.insertAdjacentHTML('beforeend', "<div id=\"waifu-toggle\">\n       <span>\u770B\u677F\u5A18</span>\n     </div>");
    var toggle = document.getElementById('waifu-toggle');
    toggle === null || toggle === void 0 ? void 0 : toggle.addEventListener('click', function () {
        toggle.classList.remove('waifu-toggle-active');
        if (toggle === null || toggle === void 0 ? void 0 : toggle.getAttribute('first-time')) {
            loadWidget(config);
            toggle === null || toggle === void 0 ? void 0 : toggle.removeAttribute('first-time');
        }
        else {
            localStorage.removeItem('waifu-display');
            document.getElementById('waifu').style.display = '';
            setTimeout(function () {
                document.getElementById('waifu').style.bottom = '0';
            }, 0);
        }
    });
    if (localStorage.getItem('waifu-display') &&
        Date.now() - Number(localStorage.getItem('waifu-display')) <= 86400000) {
        toggle === null || toggle === void 0 ? void 0 : toggle.setAttribute('first-time', 'true');
        setTimeout(function () {
            toggle === null || toggle === void 0 ? void 0 : toggle.classList.add('waifu-toggle-active');
        }, 0);
    }
    else {
        loadWidget(config);
    }
}
export { initWidget };
