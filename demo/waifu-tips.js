/*!
 * Live2D Widget
 * https://github.com/stevenjoezhang/live2d-widget
 */
var live2d_widget = (function () {
    'use strict';

    function randomSelection(obj) {
        return Array.isArray(obj) ? obj[Math.floor(Math.random() * obj.length)] : obj;
    }

    var messageTimer = null;
    function showMessage(text, timeout, priority) {
        if (!text || (sessionStorage.getItem("waifu-text") && Number(sessionStorage.getItem("waifu-text")) > priority))
            return;
        if (messageTimer) {
            clearTimeout(messageTimer);
            messageTimer = null;
        }
        text = randomSelection(text);
        sessionStorage.setItem("waifu-text", String(priority));
        var tips = document.getElementById("waifu-tips");
        tips.innerHTML = text;
        tips.classList.add("waifu-tips-active");
        messageTimer = setTimeout(function () {
            sessionStorage.removeItem("waifu-text");
            tips.classList.remove("waifu-tips-active");
        }, timeout);
    }

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
    var Model = /** @class */ (function () {
        function Model(config) {
            var apiPath = config.apiPath, cdnPath = config.cdnPath;
            var useCDN = false;
            if (typeof cdnPath === 'string') {
                useCDN = true;
                if (!cdnPath.endsWith('/'))
                    cdnPath += '/';
            }
            else if (typeof apiPath === 'string') {
                if (!apiPath.endsWith('/'))
                    apiPath += '/';
            }
            else {
                throw 'Invalid initWidget argument!';
            }
            this.useCDN = useCDN;
            this.apiPath = apiPath || '';
            this.cdnPath = cdnPath || '';
        }
        Model.prototype.loadModelList = function () {
            return __awaiter(this, void 0, void 0, function () {
                var response, _a;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0: return [4 /*yield*/, fetch("".concat(this.cdnPath, "model_list.json"))];
                        case 1:
                            response = _b.sent();
                            _a = this;
                            return [4 /*yield*/, response.json()];
                        case 2:
                            _a.modelList = _b.sent();
                            return [2 /*return*/];
                    }
                });
            });
        };
        Model.prototype.loadModel = function (modelId, modelTexturesId, message) {
            return __awaiter(this, void 0, void 0, function () {
                var target;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            localStorage.setItem('modelId', modelId.toString());
                            localStorage.setItem('modelTexturesId', modelTexturesId.toString());
                            showMessage(message, 4000, 10);
                            if (!this.useCDN) return [3 /*break*/, 3];
                            if (!!this.modelList) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.loadModelList()];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            target = randomSelection(this.modelList.models[modelId]);
                            loadlive2d('live2d', "".concat(this.cdnPath, "model/").concat(target, "/index.json"));
                            return [3 /*break*/, 4];
                        case 3:
                            loadlive2d('live2d', "".concat(this.apiPath, "get/?id=").concat(modelId, "-").concat(modelTexturesId));
                            console.log("Live2D Model ".concat(modelId, "-").concat(modelTexturesId, " Loaded"));
                            _a.label = 4;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        Model.prototype.loadRandModel = function () {
            return __awaiter(this, void 0, void 0, function () {
                var modelId, modelTexturesId, target;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            modelId = Number(localStorage.getItem('modelId'));
                            modelTexturesId = Number(localStorage.getItem('modelTexturesId'));
                            if (!(this.useCDN && modelId)) return [3 /*break*/, 3];
                            if (!!this.modelList) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.loadModelList()];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            target = randomSelection(this.modelList.models[modelId]);
                            loadlive2d('live2d', "".concat(this.cdnPath, "model/").concat(target, "/index.json"));
                            showMessage('Do you like my new clothes?', 4000, 10);
                            return [3 /*break*/, 4];
                        case 3:
                            // Optional "rand" (Random), "switch" (Switch by order)
                            fetch("".concat(this.apiPath, "rand_textures/?id=").concat(modelId, "-").concat(modelTexturesId))
                                .then(function (response) { return response.json(); })
                                .then(function (result) {
                                if (result.textures.id === 1 &&
                                    (modelTexturesId === 1 || modelTexturesId === 0)) {
                                    showMessage("I don't have any other clothes yet!", 4000, 10);
                                }
                                else if (modelId) {
                                    _this.loadModel(modelId, result.textures.id, 'Do you like my new clothes?');
                                }
                            });
                            _a.label = 4;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        Model.prototype.loadOtherModel = function () {
            return __awaiter(this, void 0, void 0, function () {
                var modelId, index;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            modelId = Number(localStorage.getItem('modelId'));
                            if (!(this.useCDN && modelId)) return [3 /*break*/, 3];
                            if (!!this.modelList) return [3 /*break*/, 2];
                            return [4 /*yield*/, this.loadModelList()];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2:
                            index = ++modelId >= this.modelList.models.length ? 0 : modelId;
                            void this.loadModel(index, 0, this.modelList.messages[index]);
                            return [3 /*break*/, 4];
                        case 3:
                            fetch("".concat(this.apiPath, "switch/?id=").concat(modelId))
                                .then(function (response) { return response.json(); })
                                .then(function (result) {
                                _this.loadModel(result.model.id, 0, result.model.message);
                            });
                            _a.label = 4;
                        case 4: return [2 /*return*/];
                    }
                });
            });
        };
        return Model;
    }());

    var fa_comment = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><!--! Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2024 Fonticons, Inc. --><path d=\"M512 240c0 114.9-114.6 208-256 208c-37.1 0-72.3-6.4-104.1-17.9c-11.9 8.7-31.3 20.6-54.3 30.6C73.6 471.1 44.7 480 16 480c-6.5 0-12.3-3.9-14.8-9.9c-2.5-6-1.1-12.8 3.4-17.4c0 0 0 0 0 0s0 0 0 0s0 0 0 0c0 0 0 0 0 0l.3-.3c.3-.3 .7-.7 1.3-1.4c1.1-1.2 2.8-3.1 4.9-5.7c4.1-5 9.6-12.4 15.2-21.6c10-16.6 19.5-38.4 21.4-62.9C17.7 326.8 0 285.1 0 240C0 125.1 114.6 32 256 32s256 93.1 256 208z\"/></svg>";

    var fa_paper_plane = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><!--! Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2024 Fonticons, Inc. --><path d=\"M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480l0-83.6c0-4 1.5-7.8 4.2-10.8L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z\"/></svg>";

    var fa_user_circle = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><!--! Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2024 Fonticons, Inc. --><path d=\"M399 384.2C376.9 345.8 335.4 320 288 320l-64 0c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z\"/></svg>";

    var fa_street_view = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><!--! Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2024 Fonticons, Inc. --><path d=\"M320 64A64 64 0 1 0 192 64a64 64 0 1 0 128 0zm-96 96c-35.3 0-64 28.7-64 64l0 48c0 17.7 14.3 32 32 32l1.8 0 11.1 99.5c1.8 16.2 15.5 28.5 31.8 28.5l38.7 0c16.3 0 30-12.3 31.8-28.5L318.2 304l1.8 0c17.7 0 32-14.3 32-32l0-48c0-35.3-28.7-64-64-64l-64 0zM132.3 394.2c13-2.4 21.7-14.9 19.3-27.9s-14.9-21.7-27.9-19.3c-32.4 5.9-60.9 14.2-82 24.8c-10.5 5.3-20.3 11.7-27.8 19.6C6.4 399.5 0 410.5 0 424c0 21.4 15.5 36.1 29.1 45c14.7 9.6 34.3 17.3 56.4 23.4C130.2 504.7 190.4 512 256 512s125.8-7.3 170.4-19.6c22.1-6.1 41.8-13.8 56.4-23.4c13.7-8.9 29.1-23.6 29.1-45c0-13.5-6.4-24.5-14-32.6c-7.5-7.9-17.3-14.3-27.8-19.6c-21-10.6-49.5-18.9-82-24.8c-13-2.4-25.5 6.3-27.9 19.3s6.3 25.5 19.3 27.9c30.2 5.5 53.7 12.8 69 20.5c3.2 1.6 5.8 3.1 7.9 4.5c3.6 2.4 3.6 7.2 0 9.6c-8.8 5.7-23.1 11.8-43 17.3C374.3 457 318.5 464 256 464s-118.3-7-157.7-17.9c-19.9-5.5-34.2-11.6-43-17.3c-3.6-2.4-3.6-7.2 0-9.6c2.1-1.4 4.8-2.9 7.9-4.5c15.3-7.7 38.8-14.9 69-20.5z\"/></svg>";

    var fa_camera_retro = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><!--! Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2024 Fonticons, Inc. --><path d=\"M220.6 121.2L271.1 96 448 96l0 96-114.8 0c-21.9-15.1-48.5-24-77.2-24s-55.2 8.9-77.2 24L64 192l0-64 128 0c9.9 0 19.7-2.3 28.6-6.8zM0 128L0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L271.1 32c-9.9 0-19.7 2.3-28.6 6.8L192 64l-32 0 0-16c0-8.8-7.2-16-16-16L80 32c-8.8 0-16 7.2-16 16l0 16C28.7 64 0 92.7 0 128zM168 304a88 88 0 1 1 176 0 88 88 0 1 1 -176 0z\"/></svg>";

    var fa_info_circle = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 512\"><!--! Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2024 Fonticons, Inc. --><path d=\"M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336l24 0 0-64-24 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l48 0c13.3 0 24 10.7 24 24l0 88 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z\"/></svg>";

    var fa_xmark = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 384 512\"><!--! Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) Copyright 2024 Fonticons, Inc. --><path d=\"M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z\"/></svg>";

    function showHitokoto() {
        // 增加 hitokoto.cn 的 API
        fetch('https://v1.hitokoto.cn')
            .then(function (response) { return response.json(); })
            .then(function (result) {
            var text = "\u8FD9\u53E5\u4E00\u8A00\u6765\u81EA <span>\u300C".concat(result.from, "\u300D</span>\uFF0C\u662F <span>").concat(result.creator, "</span> \u5728 hitokoto.cn \u6295\u7A3F\u7684\u3002");
            showMessage(result.hitokoto, 6000, 9);
            setTimeout(function () {
                showMessage(text, 4000, 9);
            }, 6000);
        });
    }
    var tools = {
        hitokoto: {
            icon: fa_comment,
            callback: showHitokoto,
        },
        asteroids: {
            icon: fa_paper_plane,
            callback: function () {
                if (window.Asteroids) {
                    if (!window.ASTEROIDSPLAYERS)
                        window.ASTEROIDSPLAYERS = [];
                    window.ASTEROIDSPLAYERS.push(new Asteroids());
                }
                else {
                    var script = document.createElement('script');
                    script.src =
                        'https://fastly.jsdelivr.net/gh/stevenjoezhang/asteroids/asteroids.js';
                    document.head.appendChild(script);
                }
            },
        },
        'switch-model': {
            icon: fa_user_circle,
            callback: function () { },
        },
        'switch-texture': {
            icon: fa_street_view,
            callback: function () { },
        },
        photo: {
            icon: fa_camera_retro,
            callback: function () {
                showMessage("The photo has been taken, isn't it cute?", 6000, 9);
                Live2D.captureName = 'photo.png';
                Live2D.captureFrame = true;
            },
        },
        info: {
            icon: fa_info_circle,
            callback: function () {
                open('https://github.com/stevenjoezhang/live2d-widget');
            },
        },
        quit: {
            icon: fa_xmark,
            callback: function () {
                localStorage.setItem('waifu-display', Date.now().toString());
                showMessage('I hope you can meet the person who is important to you again.', 2000, 11);
                var waifu = document.getElementById('waifu');
                if (!waifu)
                    return;
                waifu.style.bottom = '-500px';
                setTimeout(function () {
                    waifu.style.display = 'none';
                    var waifuToggle = document.getElementById('waifu-toggle');
                    if (!waifuToggle)
                        return;
                    waifuToggle.classList.add('waifu-toggle-active');
                }, 3000);
            },
        },
    };

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
                    baidu: 'Baidu',
                    so: '360 Search',
                    google: 'Google Search',
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
                // First visit, load the specified model and the specified texture
                modelId = 1; // Model ID
                modelTexturesId = 53; // Texture ID
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
        document.body.insertAdjacentHTML('beforeend', "<div id=\"waifu-toggle\">\n            <span>\u770B\u677F\u5A18</span>\n        </div>");
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

    return initWidget;

})();
