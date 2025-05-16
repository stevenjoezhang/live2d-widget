/**
 * @file 包含初始化看板娘小部件的函数。
 * @module index
 */

import ModelManager from './model.js';
import showMessage from './message.js';
import { randomSelection } from './utils.js';
import tools from './tools.js';
import logger from './logger.js';
import registerDrag from './drag.js';

function registerTools(model: ModelManager, config: Config) {
  (tools as Tools)['switch-model'].callback = () => model.loadOtherModel();
  (tools as Tools)['switch-texture'].callback = () => model.loadRandModel();
  if (!Array.isArray(config.tools)) {
    config.tools = Object.keys(tools);
  }
  for (const tool of config.tools!) {
    if ((tools as Tools)[tool]) {
      const { icon, callback } = (tools as Tools)[tool];
      document
        .getElementById('waifu-tool')!
        .insertAdjacentHTML(
          'beforeend',
          `<span id="waifu-tool-${tool}">${icon}</span>`,
        );
      document
        .getElementById(`waifu-tool-${tool}`)!
        .addEventListener('click', callback);
    }
  }
}

/**
 * 根据时间显示欢迎消息。
 * @param {Time} time - 时间消息配置。
 * @returns {string} 欢迎消息。
 */
function welcomeMessage(time: Time): string {
  if (location.pathname === '/') {
    // 如果是主页
    for (const { hour, text } of time) {
      const now = new Date(),
        after = hour.split('-')[0],
        before = hour.split('-')[1] || after;
      if (
        Number(after) <= now.getHours() &&
        now.getHours() <= Number(before)
      ) {
        return text;
      }
    }
  }
  const text = `欢迎阅读<span>「${document.title.split(' - ')[0]}」</span>`;
  let from;
  if (document.referrer !== '') {
    const referrer = new URL(document.referrer),
      domain = referrer.hostname.split('.')[1];
    const domains = {
      baidu: '百度',
      so: '360搜索',
      google: '谷歌搜索',
    } as const;
    if (location.hostname === referrer.hostname) return text;

    if (domain in domains) from = domains[domain as keyof typeof domains];
    else from = referrer.hostname;
    return `Hello！来自 <span>${from}</span> 的朋友<br>${text}`;
  }
  return text;
}

/**
 * 注册事件监听器。
 * @param {Result} result - 结果配置。
 */
function registerEventListener(result: Result) {
  // Detect user activity and display messages when idle
  let userAction = false;
  let userActionTimer: any;
  const messageArray = result.message.default;
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
  showMessage(welcomeMessage(result.time), 7000, 11);
  window.addEventListener('mouseover', (event) => {
    // eslint-disable-next-line prefer-const
    for (let { selector, text } of result.mouseover) {
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
    for (let { selector, text } of result.click) {
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
  result.seasons.forEach(({ date, text }) => {
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
    showMessage(result.message.console, 6000, 9);
  };
  window.addEventListener('copy', () => {
    showMessage(result.message.copy, 6000, 9);
  });
  window.addEventListener('visibilitychange', () => {
    if (!document.hidden)
      showMessage(result.message.visibilitychange, 6000, 9);
  });
}

async function initModel(model: ModelManager, config: Config) {
  let modelId: number | null = Number(localStorage.getItem('modelId'));
  let modelTexturesId: number | null = Number(
    localStorage.getItem('modelTexturesId'),
  );
  if (!modelId) {
    // 首次访问加载 指定模型 的 指定材质
    modelId = 1; // 模型 ID
    modelTexturesId = 53; // 材质 ID
  }
  await model.loadModel(modelId, modelTexturesId, '');
  const response = await fetch(config.waifuPath);
  const result = await response.json();
  registerEventListener(result);
}

/**
 * 加载看板娘小部件。
 * @param {Config} config - 看板娘配置。
 */
async function loadWidget(config: Config) {
  const model = new ModelManager(config);
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
  registerTools(model, config);
  if (config.drag) registerDrag();
  await initModel(model, config);
  document.getElementById('waifu')!.style.bottom = '0';
}

/**
 * 初始化看板娘小部件。
 * @param {string | Config} config - 看板娘配置或配置路径。
 * @param {string} [apiPath] - API 路径，如果 config 是字符串。
 */
function initWidget(config: string | Config, apiPath?: string) {
  if (typeof config === 'string') {
    config = {
      waifuPath: config,
      apiPath,
    };
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

export { initWidget };
export { loadExternalResource } from './utils.js';
