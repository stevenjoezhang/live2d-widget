/* global document, window */

import { LAppDelegate } from '@demo/lappdelegate.js';
import { LAppSubdelegate } from '@demo/lappsubdelegate.js';
import * as LAppDefine from '@demo/lappdefine.js';
import { LAppModel } from '@demo/lappmodel.js';
import { LAppPal } from '@demo/lapppal';
import logger from '../logger.js';

// 自定义的子委托类，负责 Canvas 相关的初始化和渲染管理
class AppSubdelegate extends LAppSubdelegate {
  /**
   * 初始化应用所需资源。
   * @param {HTMLCanvasElement} canvas 传入的画布对象
   */
  initialize(canvas) {
    // 初始化 WebGL 管理器，失败则返回
    if (!this._glManager.initialize(canvas)) {
      return false;
    }

    this._canvas = canvas;

    // 画布尺寸设置，支持自动和指定尺寸
    if (LAppDefine.CanvasSize === 'auto') {
      this.resizeCanvas();
    } else {
      canvas.width = LAppDefine.CanvasSize.width;
      canvas.height = LAppDefine.CanvasSize.height;
    }

    // 设置纹理管理器使用的 GL 管理器
    this._textureManager.setGlManager(this._glManager);

    const gl = this._glManager.getGl();

    // 若帧缓冲对象未初始化，获取当前的帧缓冲绑定
    if (!this._frameBuffer) {
      this._frameBuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    }

    // 启用混合模式以实现透明效果
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // 初始化视图（AppView）
    this._view.initialize(this);
    this._view._gear = {
      render: () => {},
      isHit: () => {},
      release: () => {}
    };
    this._view._back = {
      render: () => {},
      release: () => {}
    };
    // this._view.initializeSprite();

    // Live2D 管理器与当前 subdelegate 关联
    // this._live2dManager.initialize(this);
    this._live2dManager._subdelegate = this;

    // 监听画布大小变化，实现响应式自适应
    this._resizeObserver = new window.ResizeObserver(
      (entries, observer) =>
        this.resizeObserverCallback.call(this, entries, observer)
    );
    this._resizeObserver.observe(this._canvas);

    return true;
  }

  /**
   * 画布大小变化时重新调整并重新初始化视图
   */
  onResize() {
    this.resizeCanvas();
    this._view.initialize(this);
    // this._view.initializeSprite();
  }

  /**
   * 渲染主循环，定期被调用以更新画面
   */
  update() {
    // 检查 WebGL 上下文是否丢失，若丢失则不再渲染
    if (this._glManager.getGl().isContextLost()) {
      return;
    }

    // 若标记需要调整尺寸，则调用 onResize
    if (this._needResize) {
      this.onResize();
      this._needResize = false;
    }

    const gl = this._glManager.getGl();

    // 初始化画布为全透明
    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    // 开启深度测试，保证模型遮挡关系正确
    gl.enable(gl.DEPTH_TEST);

    // 设定深度函数，近处物体覆盖远处
    gl.depthFunc(gl.LEQUAL);

    // 清除颜色和深度缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearDepth(1.0);

    // 再次开启混合模式，保证透明度正常
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // 渲染视图内容
    this._view.render();
  }
}

// 应用主委托类，负责管理主循环、画布与模型切换等全局逻辑
export class AppDelegate extends LAppDelegate {
  /**
   * 启动主循环。
   */
  run() {
    // 主循环函数，负责更新时间与所有 subdelegate
    const loop = () => {
      // 更新时间
      LAppPal.updateTime();

      // 遍历所有 subdelegate，调用 update 进行渲染
      for (let i = 0; i < this._subdelegates.getSize(); i++) {
        this._subdelegates.at(i).update();
      }

      // 递归调用，实现动画循环
      this._drawFrameId = window.requestAnimationFrame(loop);
    };
    loop();
  }

  stop() {
    if (this._drawFrameId) {
      window.cancelAnimationFrame(this._drawFrameId);
      this._drawFrameId = null;
    }
  }

  release() {
    this.stop();
    this.releaseEventListener();
    this._subdelegates.clear();

    this._cubismOption = null;
  }

  releaseEventListener() {
    document.removeEventListener('pointerdown', this.pointBeganEventListener, {
      passive: true
    });
    this.pointBeganEventListener = null;
    document.removeEventListener('pointermove', this.pointMovedEventListener, {
      passive: true
    });
    this.pointMovedEventListener = null;
    document.removeEventListener('pointerup', this.pointEndedEventListener, {
      passive: true
    });
    this.pointEndedEventListener = null;
    document.removeEventListener('pointercancel', this.pointCancelEventListener, {
      passive: true
    });
    this.pointCancelEventListener = null;
  }

  /**
   * 创建画布并初始化所有 Subdelegate
   */
  initializeSubdelegates() {
    // 预留空间以提升性能
    this._canvases.prepareCapacity(LAppDefine.CanvasNum);
    this._subdelegates.prepareCapacity(LAppDefine.CanvasNum);

    // 获取页面中的 live2d 画布元素
    const canvas = document.getElementById('live2d');
    this._canvases.pushBack(canvas);

    // 设置画布样式尺寸，保持与实际尺寸一致
    canvas.style.width = canvas.width;
    canvas.style.height = canvas.height;

    // 针对每个画布创建 subdelegate，并完成初始化
    for (let i = 0; i < this._canvases.getSize(); i++) {
      const subdelegate = new AppSubdelegate();
      const result = subdelegate.initialize(this._canvases.at(i));
      if (!result) {
        logger.error('Failed to initialize AppSubdelegate');
        return;
      }
      this._subdelegates.pushBack(subdelegate);
    }

    // 检查每个 subdelegate 的 WebGL 上下文是否丢失
    for (let i = 0; i < LAppDefine.CanvasNum; i++) {
      if (this._subdelegates.at(i).isContextLost()) {
        logger.error(
          `The context for Canvas at index ${i} was lost, possibly because the acquisition limit for WebGLRenderingContext was reached.`
        );
      }
    }
  }

  /**
   * 切换模型
   * @param {string} modelSettingPath 模型设置文件路径
   */
  changeModel(modelSettingPath) {
    const segments = modelSettingPath.split('/');
    const modelJsonName = segments.pop();
    const modelPath = segments.join('/') + '/';
    // 获取当前的 Live2D 管理器
    const live2dManager = this._subdelegates.at(0).getLive2DManager();
    // 释放所有旧模型
    live2dManager.releaseAllModel();
    // 新建模型实例，设置 subdelegate 并加载资源
    const instance = new LAppModel();
    instance.setSubdelegate(live2dManager._subdelegate);
    instance.loadAssets(modelPath, modelJsonName);
    // 将新模型加入到模型列表
    live2dManager._models.pushBack(instance);
  }

  get subdelegates() {
    return this._subdelegates;
  }
}
