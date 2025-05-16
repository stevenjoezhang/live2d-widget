/**
 * @file 定义看板娘配置的类型。
 * @module types/config
 */
interface Config {
  /**
   * 看板娘配置文件的路径。
   * @type {string}
   */
  waifuPath: string;
  /**
   * API 的路径，如果需要使用 API 加载模型。
   * @type {string | undefined}
   */
  apiPath?: string;
  /**
   * CDN 的路径，如果需要使用 CDN 加载模型。
   * @type {string | undefined}
   */
  cdnPath?: string;
  /**
   * 默认模型的 id。
   * @type {string | undefined}
   */
  modelId?: number;
  /**
   * 需要显示的工具列表。
   * @type {string[] | undefined}
   */
  tools?: string[];
  /**
   * 支持拖动看板娘。
   * @type {boolean | undefined}
   */
  drag?: boolean;
  /**
   * 日志的等级。
   * @type {LogLevel | undefined}
   */
  logLevel?: LogLevel;
}
