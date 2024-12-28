/**
 * @file 定义工具配置的类型。
 * @module types/tools
 */
interface Tools {
  /**
   * 工具的键值对，键为工具的名称。
   * @type {string}
   */
  [key: string]: {
    /**
     * 工具的图标，通常为 SVG 字符串。
     * @type {string}
     */
    icon: string;
    /**
     * 工具的回调函数。
     * @type {() => void}
     */
    callback: () => void;
  };
}
