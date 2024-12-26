import Model from './model.js';
import showMessage from './message.js';
import randomSelection from './utils.js';
import tools from './tools.js';
function loadWidget(config) {
    var model = new Model(config);
    localStorage.removeItem('waifu-display');
    sessionStorage.removeItem('waifu-text');
    document.body.insertAdjacentHTML('beforeend', "<div id=\"waifu\">\n            <div id=\"waifu-tips\"></div>\n            <canvas id=\"live2d\" width=\"800\" height=\"800\"></canvas>\n            <div id=\"waifu-tool\"></div>\n        </div>");
    // https://stackoverflow.com/questions/24148403/trigger-css-transition-on-appended-element
    setTimeout(function () {
        document.getElementById('waifu').style.bottom = '0';
    }, 0);
    (function registerTools() {
        tools['switch-model'].callback = function () { return model.loadOtherModel(); };
        tools['switch-texture'].callback = function () { return model.loadRandModel(); };
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
    })();
    function welcomeMessage(time) {
        if (location.pathname === '/') {
            // 如果是主页
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
    function registerEventListener(result) {
        // Detect user activity and display messages when idle
        var userAction = false;
        var userActionTimer;
        var messageArray = result.message.default;
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
        showMessage(welcomeMessage(result.time), 7000, 11);
        window.addEventListener('mouseover', function (event) {
            var _a;
            for (var _i = 0, _b = result.mouseover; _i < _b.length; _i++) {
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
            for (var _i = 0, _b = result.click; _i < _b.length; _i++) {
                var _c = _b[_i], selector = _c.selector, text = _c.text;
                if (!((_a = event.target) === null || _a === void 0 ? void 0 : _a.closest(selector)))
                    continue;
                text = randomSelection(text);
                text = text.replace('{text}', event.target.innerText);
                showMessage(text, 4000, 8);
                return;
            }
        });
        result.seasons.forEach(function (_a) {
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
            showMessage(result.message.console, 6000, 9);
        };
        window.addEventListener('copy', function () {
            showMessage(result.message.copy, 6000, 9);
        });
        window.addEventListener('visibilitychange', function () {
            if (!document.hidden)
                showMessage(result.message.visibilitychange, 6000, 9);
        });
    }
    (function initModel() {
        var modelId = Number(localStorage.getItem('modelId'));
        var modelTexturesId = Number(localStorage.getItem('modelTexturesId'));
        if (modelId === null) {
            // 首次访问加载 指定模型 的 指定材质
            modelId = 1; // 模型 ID
            modelTexturesId = 53; // 材质 ID
        }
        void model.loadModel(modelId, modelTexturesId, '');
        fetch(config.waifuPath)
            .then(function (response) { return response.json(); })
            .then(registerEventListener);
    })();
}
function initWidget(config, apiPath) {
    if (typeof config === 'string') {
        config = {
            waifuPath: config,
            apiPath: apiPath,
        };
    }
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
export default initWidget;
