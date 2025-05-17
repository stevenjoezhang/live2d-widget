/**
 * @file 定义 tips 配置的类型。
 * @module types/result
 */
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
