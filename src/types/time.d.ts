/**
 * @file 定义时间配置的类型。
 * @module types/time
 */
type Time = {
  /**
   * 时间段，格式为 "HH-HH"，例如 "00-06" 表示 0 点到 6 点。
   * @type {string}
   */
  hour: string;
  /**
   * 在该时间段显示的消息。
   * @type {string}
   */
  text: string;
}[];
