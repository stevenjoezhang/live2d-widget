/**
 * @file 包含看板娘工具的配置和函数。
 * @module tools
 */

import {
  fa_comment,
  fa_paper_plane,
  fa_user_circle,
  fa_street_view,
  fa_camera_retro,
  fa_info_circle,
  fa_xmark
} from './icons.js';
import { showMessage } from './message.js';

/**
 * 显示一句一言。
 */
async function showHitokoto() {
  // 增加 hitokoto.cn 的 API
  const response = await fetch('https://v1.hitokoto.cn');
  const result = await response.json();
  const text = `这句一言来自 <span>「${result.from}」</span>，是 <span>${result.creator}</span> 在 hitokoto.cn 投稿的。`;
  showMessage(result.hitokoto, 6000, 9);
  setTimeout(() => {
    showMessage(text, 4000, 9);
  }, 6000);
}

/**
 * 看板娘工具配置。
 * @type {Object}
 */
const tools = {
  hitokoto: {
    icon: fa_comment,
    callback: showHitokoto,
  },
  asteroids: {
    icon: fa_paper_plane,
    callback: () => {
      if (window.Asteroids) {
        if (!window.ASTEROIDSPLAYERS) window.ASTEROIDSPLAYERS = [];
        window.ASTEROIDSPLAYERS.push(new window.Asteroids());
      } else {
        const script = document.createElement('script');
        script.src =
          'https://fastly.jsdelivr.net/gh/stevenjoezhang/asteroids/asteroids.js';
        document.head.appendChild(script);
      }
    },
  },
  'switch-model': {
    icon: fa_user_circle,
    callback: () => {},
  },
  'switch-texture': {
    icon: fa_street_view,
    callback: () => {},
  },
  photo: {
    icon: fa_camera_retro,
    callback: () => {
      showMessage('照好了嘛，是不是很可爱呢？', 6000, 9);
      const canvas = document.getElementById('live2d') as HTMLCanvasElement;
      if (!canvas) return;
      const imageUrl = canvas.toDataURL();

      const link = document.createElement('a');
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
    callback: () => {
      open('https://github.com/stevenjoezhang/live2d-widget');
    },
  },
  quit: {
    icon: fa_xmark,
    callback: () => {
      localStorage.setItem('waifu-display', Date.now().toString());
      showMessage('愿你有一天能与重要的人重逢。', 2000, 11);
      const waifu = document.getElementById('waifu');
      if (!waifu) return;
      waifu.style.bottom = '-500px';
      setTimeout(() => {
        waifu.style.display = 'none';
        const waifuToggle = document.getElementById('waifu-toggle');
        if (!waifuToggle) return;
        waifuToggle.classList.add('waifu-toggle-active');
      }, 3000);
    },
  },
};

export default tools;
