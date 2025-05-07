/**
 * @file 定义全局 window 对象的类型。
 * @module types/window
 */
interface Window {
  /**
   * 小行星游戏类。
   * @type {any}
   */
  Asteroids: any;
   /**
   * 小行星游戏玩家数组。
   * @type {any[]}
   */
  ASTEROIDSPLAYERS: any[];
  /**
   * 初始化看板娘小部件的函数。
   * @type {(config: string | Config, apiPath?: string) => void}
   */
  initWidget: (config: string | Config, apiPath?: string) => void;
  /**
   * 加载外部资源的函数。
   * @type {(url: string, type: string) => Promise<void>}
   */
  loadExternalResource: (url: string, type: string) => Promise<string>;
}
