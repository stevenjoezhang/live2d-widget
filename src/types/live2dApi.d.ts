/**
 * @file 定义 Live2D API 的类型。
 * @module types/live2dApi
 */
declare namespace Live2D {
  /**
   * 捕获的图片名称。
   * @type {string}
   */
  export let captureName: string;
  /**
   * 是否捕获帧。
   * @type {boolean}
   */
  export let captureFrame: boolean;
}

/**
 * 加载 Live2D 模型。
 * @param {string} id - Canvas 元素的 ID。
 * @param {string} path - 模型配置文件的路径。
 */
declare function loadlive2d(id: string, path: string): void;
