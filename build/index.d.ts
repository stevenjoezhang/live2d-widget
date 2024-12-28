/**
 * @file 包含初始化看板娘小部件的函数。
 * @module index
 */
/**
 * 初始化看板娘小部件。
 * @param {string | Config} config - 看板娘配置或配置路径。
 * @param {string} [apiPath] - API 路径，如果 config 是字符串。
 */
declare function initWidget(config: string | Config, apiPath?: string): void;
export default initWidget;
