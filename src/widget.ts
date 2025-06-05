/**
 * @file Contains functions for initializing the waifu widget.
 * @module widget
 */

import { ModelManager, Config, ModelList } from './model.js';
import { showMessage, welcomeMessage, Time } from './message.js';
import { randomSelection } from './utils.js';
import { ToolsManager } from './tools.js';
import logger from './logger.js';
import registerDrag from './drag.js';
import { fa_child } from './icons.js';

interface Tips {
  /**
   * Default message configuration.
   */
  message: {
    /**
     * Default message array.
     * @type {string[]}
     */
    default: string[];
    /**
     * Console message.
     * @type {string}
     */
    console: string;
    /**
     * Copy message.
     * @type {string}
     */
    copy: string;
    /**
     * Visibility change message.
     * @type {string}
     */
    visibilitychange: string;
    changeSuccess: string;
    changeFail: string;
    photo: string;
    goodbye: string;
    hitokoto: string;
    welcome: string;
    referrer: string;
    hoverBody: string;
    tapBody: string;
  };
  /**
   * Time configuration.
   * @type {Time}
   */
  time: Time;
  /**
   * Mouseover message configuration.
   * @type {Array<{selector: string, text: string | string[]}>}
   */
  mouseover: {
    selector: string;
    text: string | string[];
  }[];
  /**
   * Click message configuration.
   * @type {Array<{selector: string, text: string | string[]}>}
   */
  click: {
    selector: string;
    text: string | string[];
  }[];
  /**
   * Season message configuration.
   * @type {Array<{date: string, text: string | string[]}>}
   */
  seasons: {
    date: string;
    text: string | string[];
  }[];
  models: ModelList[];
}

/**
 * Register event listeners.
 * @param {Tips} tips - Result configuration.
 */
function registerEventListener(tips: Tips) {
  // Detect user activity and display messages when idle
  let userAction = false;
  let userActionTimer: any;
  const messageArray = tips.message.default;
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
        showMessage(messageArray, 6000, 9);
      }, 20000);
    }
  }, 1000);

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
  window.addEventListener('live2d:hoverbody', () => {
    const text = randomSelection(tips.message.hoverBody);
    showMessage(text, 4000, 8, false);
  });
  window.addEventListener('live2d:tapbody', () => {
    const text = randomSelection(tips.message.tapBody);
    showMessage(text, 4000, 9);
  });

  const devtools = () => {};
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
 * Load the waifu widget.
 * @param {Config} config - Waifu configuration.
 */
async function loadWidget(config: Config) {
  localStorage.removeItem('waifu-display');
  sessionStorage.removeItem('waifu-message-priority');
  document.body.insertAdjacentHTML(
    'beforeend',
    `<div id="waifu">
       <div id="waifu-tips"></div>
       <div id="waifu-canvas">
         <canvas id="live2d" width="800" height="800"></canvas>
       </div>
       <div id="waifu-tool"></div>
     </div>`,
  );
  let models: ModelList[] = [];
  let tips: Tips | null;
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
  if (config.drag) registerDrag();
  document.getElementById('waifu')?.classList.add('waifu-active');
}

/**
 * Initialize the waifu widget.
 * @param {string | Config} config - Waifu configuration or configuration path.
 */
function initWidget(config: string | Config) {
  if (typeof config === 'string') {
    logger.error('Your config for Live2D initWidget is outdated. Please refer to https://github.com/stevenjoezhang/live2d-widget/blob/master/dist/autoload.js');
    return;
  }
  logger.setLevel(config.logLevel);
  document.body.insertAdjacentHTML(
    'beforeend',
    `<div id="waifu-toggle">
       ${fa_child}
     </div>`,
  );
  const toggle = document.getElementById('waifu-toggle');
  toggle?.addEventListener('click', () => {
    toggle?.classList.remove('waifu-toggle-active');
    if (toggle?.getAttribute('first-time')) {
      loadWidget(config as Config);
      toggle?.removeAttribute('first-time');
    } else {
      localStorage.removeItem('waifu-display');
      document.getElementById('waifu')?.classList.remove('waifu-hidden');
      setTimeout(() => {
        document.getElementById('waifu')?.classList.add('waifu-active');
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
