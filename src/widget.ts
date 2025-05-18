/**
 * @file 包含初始化看板娘小部件的函数。
 * @module widget
 */

import { ModelManager, Config } from './model.js';
import { showMessage, welcomeMessage, Time } from './message.js';
import { randomSelection } from './utils.js';
import tools from './tools.js';
import logger from './logger.js';
import registerDrag from './drag.js';

interface Tips {
  /**
   * 默认消息配置。
   */
  message: {
    /**
     * 默认消息数组。
     * @type {string[]}
     */
    default: string[];
    /**
     * 控制台消息。
     * @type {string}
     */
    console: string;
    /**
     * 复制消息。
     * @type {string}
     */
    copy: string;
    /**
     * 可见性更改消息。
     * @type {string}
     */
    visibilitychange: string;
  };
  /**
   * 时间配置。
   * @type {Time}
   */
  time: Time;
  /**
   * 鼠标悬停消息配置。
   * @type {Array<{selector: string, text: string | string[]}>}
   */
  mouseover: {
    selector: string;
    text: string | string[];
  }[];
  /**
   * 点击消息配置。
   * @type {Array<{selector: string, text: string | string[]}>}
   */
  click: {
    selector: string;
    text: string | string[];
  }[];
  /**
   * 季节消息配置。
   * @type {Array<{date: string, text: string | string[]}>}
   */
  seasons: {
    date: string;
    text: string | string[];
  }[];
}

function registerTools(model: ModelManager, config: Config) {
  tools['switch-model'].callback = () => model.loadNextModel();
  tools['switch-texture'].callback = () => model.loadRandTexture();
  if (!Array.isArray(config.tools)) {
    config.tools = Object.keys(tools);
  }
  for (const toolName of config.tools!) {
    if (tools[toolName]) {
      const { icon, callback } = tools[toolName];
      document
        .getElementById('waifu-tool')!
        .insertAdjacentHTML(
          'beforeend',
          `<span id="waifu-tool-${toolName}">${icon}</span>`,
        );
      document
        .getElementById(`waifu-tool-${toolName}`)!
        .addEventListener('click', callback);
    }
  }
}

/**
 * 注册事件监听器。
 * @param {Tips} tips - 结果配置。
 */
function registerEventListener(tips: Tips) {
  // Detect user activity and display messages when idle
  let userAction = false;
  let userActionTimer: any;
  const messageArray = tips.message.default;
  let lastHoverElement: any;
  window.addEventListener('mousemove', () => (userAction = true));
  window.addEventListener('keydown', () => (userAction = true));
  setInterval(() => {
    if (userAction) {
      userAction = false;
      clearInterval(userActionTimer);
      userActionTimer = null;
    } else if (!userActionTimer) {
      userActionTimer = setInterval(() => {
        showMessage(randomSelection(messageArray) as string, 6000, 9);
      }, 20000);
    }
  }, 1000);
  showMessage(welcomeMessage(tips.time), 7000, 11);
  window.addEventListener('mouseover', (event) => {
    // eslint-disable-next-line prefer-const
    for (let { selector, text } of tips.mouseover) {
      if (!(event.target as HTMLElement)?.closest(selector)) continue;
      if (lastHoverElement === selector) return;
      lastHoverElement = selector;
      text = randomSelection(text);
      text = (text as string).replace(
        '{text}',
        (event.target as HTMLElement).innerText,
      );
      showMessage(text, 4000, 8);
      return;
    }
  });
  window.addEventListener('click', (event) => {
    // eslint-disable-next-line prefer-const
    for (let { selector, text } of tips.click) {
      if (!(event.target as HTMLElement)?.closest(selector)) continue;
      text = randomSelection(text);
      text = (text as string).replace(
        '{text}',
        (event.target as HTMLElement).innerText,
      );
      showMessage(text, 4000, 8);
      return;
    }
  });
  tips.seasons.forEach(({ date, text }) => {
    const now = new Date(),
      after = date.split('-')[0],
      before = date.split('-')[1] || after;
    if (
      Number(after.split('/')[0]) <= now.getMonth() + 1 &&
      now.getMonth() + 1 <= Number(before.split('/')[0]) &&
      Number(after.split('/')[1]) <= now.getDate() &&
      now.getDate() <= Number(before.split('/')[1])
    ) {
      text = randomSelection(text);
      text = (text as string).replace('{year}', String(now.getFullYear()));
      messageArray.push(text);
    }
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

/**
 * 加载看板娘小部件。
 * @param {Config} config - 看板娘配置。
 */
async function loadWidget(config: Config) {
  localStorage.removeItem('waifu-display');
  sessionStorage.removeItem('waifu-text');
  document.body.insertAdjacentHTML(
    'beforeend',
    `<div id="waifu">
       <div id="waifu-tips"></div>
       <canvas id="live2d" width="800" height="800"></canvas>
       <div id="waifu-tool"></div>
     </div>`,
  );
  const model = new ModelManager(config);
  await model.loadModel('');
  registerTools(model, config);
  if (config.drag) registerDrag();
  if (config.waifuPath) {
    const response = await fetch(config.waifuPath);
    const result = await response.json();
    registerEventListener(result);
  }
  document.getElementById('waifu')!.style.bottom = '0';
}

/**
 * 初始化看板娘小部件。
 * @param {string | Config} config - 看板娘配置或配置路径。
 */
function initWidget(config: string | Config) {
  if (typeof config === 'string') {
    logger.error('Your config for Live2d initWidget is outdated. Please refer to https://github.com/stevenjoezhang/live2d-widget/blob/master/dist/autoload.js');
    return;
  }
  logger.setLevel(config.logLevel);
  document.body.insertAdjacentHTML(
    'beforeend',
    `<div id="waifu-toggle">
       <span>看板娘</span>
     </div>`,
  );
  const toggle = document.getElementById('waifu-toggle');
  toggle?.addEventListener('click', () => {
    toggle!.classList.remove('waifu-toggle-active');
    if (toggle?.getAttribute('first-time')) {
      loadWidget(config as Config);
      toggle?.removeAttribute('first-time');
    } else {
      localStorage.removeItem('waifu-display');
      document.getElementById('waifu')!.style.display = '';
      setTimeout(() => {
        document.getElementById('waifu')!.style.bottom = '0';
      }, 0);
    }
  });
  if (
    localStorage.getItem('waifu-display') &&
    Date.now() - Number(localStorage.getItem('waifu-display')) <= 86400000
  ) {
    toggle?.setAttribute('first-time', 'true');
    setTimeout(() => {
      toggle?.classList.add('waifu-toggle-active');
    }, 0);
  } else {
    loadWidget(config as Config);
  }
}

export { initWidget, Tips };
