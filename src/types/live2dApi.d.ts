/**
 * @file Define types for Live2D API.
 * @module types/live2dApi
 */
declare namespace Live2D {
  /**
   * Initialize the Live2D runtime environment.
   */
  export function init(): void;
  /**
   * Set the WebGL context
   * @param gl WebGL rendering context
   */
  export function setGL(gl: WebGLRenderingContext): void;
}

/**
 * Static class related to Live2D models.
 */
declare class Live2DModelWebGL {
  /**
   * Load a Live2D model from a binary buffer
   * @param buf ArrayBuffer data of the model file
   */
  static loadModel(buf: ArrayBuffer): Live2DModelWebGL;

  /**
   * Bind a texture to the model
   * @param index Texture index
   * @param texture WebGL texture object
   */
  setTexture(index: number, texture: WebGLTexture): void;

  /**
   * Return the canvas width of the model
   */
  getCanvasWidth(): number;

  /**
   * Set the transformation matrix of the model
   * @param matrix 4x4 matrix array
   */
  setMatrix(matrix: number[]): void;

  /**
   * Set parameter values (e.g., animation parameters)
   * @param paramName Parameter name
   * @param value Parameter value
   */
  setParamFloat(paramName: string, value: number): void;

  /**
   * Refresh the internal data of the model
   */
  update(): void;

  /**
   * Draw the current frame
   */
  draw(): void;

  /**
   * Whether the current mode is premultiplied alpha
   */
  isPremultipliedAlpha?(): boolean;
}
