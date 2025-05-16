/**
 * @file 定义 Live2D API 的类型。
 * @module types/live2dApi
 */
declare namespace Live2D {
  /**
   * 初始化Live2D运行环境。
   */
  export function init(): void;
  /**
   * 设置WebGL上下文
   * @param gl WebGL渲染上下文
   */
  export function setGL(gl: WebGLRenderingContext): void;
}

/**
 * Live2D 模型相关的静态类。
 */
declare class Live2DModelWebGL {
  /**
   * 从二进制缓冲区加载Live2D模型
   * @param buf 模型文件的ArrayBuffer数据
   */
  static loadModel(buf: ArrayBuffer): Live2DModelWebGL;

  /**
   * 绑定纹理到模型上
   * @param index 纹理序号
   * @param texture WebGL纹理对象
   */
  setTexture(index: number, texture: WebGLTexture): void;

  /**
   * 返回模型画布宽度
   */
  getCanvasWidth(): number;

  /**
   * 设置模型的变换矩阵
   * @param matrix 4x4矩阵数组
   */
  setMatrix(matrix: number[]): void;

  /**
   * 设置参数值（如动画参数）
   * @param paramName 参数名称
   * @param value 参数值
   */
  setParamFloat(paramName: string, value: number): void;

  /**
   * 刷新模型内部数据
   */
  update(): void;

  /**
   * 绘制当前帧
   */
  draw(): void;

  /**
   * 当前是否为预乘Alpha模式
   */
  isPremultipliedAlpha?(): boolean;
}
