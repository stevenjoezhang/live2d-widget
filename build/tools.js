import fa_comment from '@fortawesome/fontawesome-free/svgs/solid/comment.svg';
import fa_paper_plane from '@fortawesome/fontawesome-free/svgs/solid/paper-plane.svg';
import fa_user_circle from '@fortawesome/fontawesome-free/svgs/solid/circle-user.svg';
import fa_street_view from '@fortawesome/fontawesome-free/svgs/solid/street-view.svg';
import fa_camera_retro from '@fortawesome/fontawesome-free/svgs/solid/camera-retro.svg';
import fa_info_circle from '@fortawesome/fontawesome-free/svgs/solid/circle-info.svg';
import fa_xmark from '@fortawesome/fontawesome-free/svgs/solid/xmark.svg';
import showMessage from './message.js';
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
            showMessage('照好了嘛，是不是很可爱呢？', 6000, 9);
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
