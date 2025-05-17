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
import fa_comment from '@fortawesome/fontawesome-free/svgs/solid/comment.svg';
import fa_paper_plane from '@fortawesome/fontawesome-free/svgs/solid/paper-plane.svg';
import fa_user_circle from '@fortawesome/fontawesome-free/svgs/solid/circle-user.svg';
import fa_street_view from '@fortawesome/fontawesome-free/svgs/solid/street-view.svg';
import fa_camera_retro from '@fortawesome/fontawesome-free/svgs/solid/camera-retro.svg';
import fa_info_circle from '@fortawesome/fontawesome-free/svgs/solid/circle-info.svg';
import fa_xmark from '@fortawesome/fontawesome-free/svgs/solid/xmark.svg';
import { showMessage } from './message.js';
function showHitokoto() {
    return __awaiter(this, void 0, void 0, function () {
        var response, result, text;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, fetch('https://v1.hitokoto.cn')];
                case 1:
                    response = _a.sent();
                    return [4, response.json()];
                case 2:
                    result = _a.sent();
                    text = "\u8FD9\u53E5\u4E00\u8A00\u6765\u81EA <span>\u300C".concat(result.from, "\u300D</span>\uFF0C\u662F <span>").concat(result.creator, "</span> \u5728 hitokoto.cn \u6295\u7A3F\u7684\u3002");
                    showMessage(result.hitokoto, 6000, 9);
                    setTimeout(function () {
                        showMessage(text, 4000, 9);
                    }, 6000);
                    return [2];
            }
        });
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
                window.ASTEROIDSPLAYERS.push(new window.Asteroids());
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
            showMessage('照好了嘛，是不是很可爱呢？', 6000, 9);
            var canvas = document.getElementById('live2d');
            if (!canvas)
                return;
            var imageUrl = canvas.toDataURL();
            var link = document.createElement('a');
            link.style.display = 'none';
            link.href = imageUrl;
            link.download = 'live2d-photo.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
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
            showMessage('愿你有一天能与重要的人重逢。', 2000, 11);
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
export default tools;
