/* global document, window, Event */

import { LAppDelegate } from '@demo/lappdelegate.js';
import { LAppSubdelegate } from '@demo/lappsubdelegate.js';
import * as LAppDefine from '@demo/lappdefine.js';
import { LAppModel } from '@demo/lappmodel.js';
import { LAppPal } from '@demo/lapppal';
import logger from '../logger.js';

LAppPal.printMessage = () => {};

// Custom subdelegate class, responsible for Canvas-related initialization and rendering management
class AppSubdelegate extends LAppSubdelegate {
  /**
   * Initialize resources required by the application.
   * @param {HTMLCanvasElement} canvas The canvas object passed in
   */
  initialize(canvas) {
    // Initialize WebGL manager, return false if failed
    if (!this._glManager.initialize(canvas)) {
      return false;
    }

    this._canvas = canvas;

    // Canvas size setting, supports auto and specified size
    if (LAppDefine.CanvasSize === 'auto') {
      this.resizeCanvas();
    } else {
      canvas.width = LAppDefine.CanvasSize.width;
      canvas.height = LAppDefine.CanvasSize.height;
    }

    // Set the GL manager for the texture manager
    this._textureManager.setGlManager(this._glManager);

    const gl = this._glManager.getGl();

    // If the framebuffer object is not initialized, get the current framebuffer binding
    if (!this._frameBuffer) {
      this._frameBuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    }

    // Enable blend mode for transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Initialize the view (AppView)
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

    // Associate Live2D manager with the current subdelegate
    // this._live2dManager.initialize(this);
    this._live2dManager._subdelegate = this;

    // Listen for canvas size changes for responsive adaptation
    this._resizeObserver = new window.ResizeObserver(
      (entries, observer) =>
        this.resizeObserverCallback.call(this, entries, observer)
    );
    this._resizeObserver.observe(this._canvas);

    return true;
  }

  /**
   * Adjust and reinitialize the view when the canvas size changes
   */
  onResize() {
    this.resizeCanvas();
    this._view.initialize(this);
    // this._view.initializeSprite();
  }

  /**
   * Main render loop, called periodically to update the screen
   */
  update() {
    // Check if the WebGL context is lost, if so, stop rendering
    if (this._glManager.getGl().isContextLost()) {
      return;
    }

    // If resize is needed, call onResize
    if (this._needResize) {
      this.onResize();
      this._needResize = false;
    }

    const gl = this._glManager.getGl();

    // Initialize the canvas as fully transparent
    gl.clearColor(0.0, 0.0, 0.0, 0.0);

    // Enable depth test to ensure correct model occlusion
    gl.enable(gl.DEPTH_TEST);

    // Set depth function so nearer objects cover farther ones
    gl.depthFunc(gl.LEQUAL);

    // Clear color and depth buffers
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clearDepth(1.0);

    // Enable blend mode again to ensure transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // Render the view content
    this._view.render();
  }
}

// Main application delegate class, responsible for managing the main loop, canvas, model switching, and other global logic
export class AppDelegate extends LAppDelegate {
  /**
   * Start the main loop.
   */
  run() {
    // Main loop function, responsible for updating time and all subdelegates
    const loop = () => {
      // Update time
      LAppPal.updateTime();

      // Iterate all subdelegates and call update for rendering
      for (let i = 0; i < this._subdelegates.getSize(); i++) {
        this._subdelegates.at(i).update();
      }

      // Recursive call for animation loop
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

  transformOffset(e) {
    const subdelegate = this._subdelegates.at(0);
    const rect = subdelegate.getCanvas().getBoundingClientRect();
    const localX = e.pageX - rect.left;
    const localY = e.pageY - rect.top;
    const posX = localX * window.devicePixelRatio;
    const posY = localY * window.devicePixelRatio;
    const x = subdelegate._view.transformViewX(posX);
    const y = subdelegate._view.transformViewY(posY);
    return {
      x, y
    };
  }

  onMouseMove(e) {
    const lapplive2dmanager = this._subdelegates.at(0).getLive2DManager();
    const { x, y } = this.transformOffset(e);
    const model = lapplive2dmanager._models.at(0);

    lapplive2dmanager.onDrag(x, y);
    lapplive2dmanager.onTap(x, y);
    if (model.hitTest(LAppDefine.HitAreaNameBody, x, y)) {
      window.dispatchEvent(new Event('live2d:hoverbody'));
    }
  }

  onMouseEnd(e) {
    const lapplive2dmanager = this._subdelegates.at(0).getLive2DManager();
    const { x, y } = this.transformOffset(e);
    lapplive2dmanager.onDrag(0.0, 0.0);
    lapplive2dmanager.onTap(x, y);
  }

  onTap(e) {
    const lapplive2dmanager = this._subdelegates.at(0).getLive2DManager();
    const { x, y } = this.transformOffset(e);
    const model = lapplive2dmanager._models.at(0);

    if (model.hitTest(LAppDefine.HitAreaNameBody, x, y)) {
      window.dispatchEvent(new Event('live2d:tapbody'));
    }
  }

  initializeEventListener() {
    this.mouseMoveEventListener = this.onMouseMove.bind(this);
    this.mouseEndedEventListener = this.onMouseEnd.bind(this);
    this.tapEventListener = this.onTap.bind(this);

    document.addEventListener('mousemove', this.mouseMoveEventListener, {
      passive: true
    });
    document.addEventListener('mouseout', this.mouseEndedEventListener, {
      passive: true
    });
    document.addEventListener('pointerdown', this.tapEventListener, {
      passive: true
    });
  }

  releaseEventListener() {
    document.removeEventListener('mousemove', this.mouseMoveEventListener, {
      passive: true
    });
    this.mouseMoveEventListener = null;
    document.removeEventListener('mouseout', this.mouseEndedEventListener, {
      passive: true
    });
    this.mouseEndedEventListener = null;
    document.removeEventListener('pointerdown', this.tapEventListener, {
      passive: true
    });
  }

  /**
   * Create canvas and initialize all Subdelegates
   */
  initializeSubdelegates() {
    // Reserve space to improve performance
    this._canvases.prepareCapacity(LAppDefine.CanvasNum);
    this._subdelegates.prepareCapacity(LAppDefine.CanvasNum);

    // Get the live2d canvas element from the page
    const canvas = document.getElementById('live2d');
    this._canvases.pushBack(canvas);

    // Set canvas style size to match actual size
    canvas.style.width = canvas.width;
    canvas.style.height = canvas.height;

    // For each canvas, create a subdelegate and complete initialization
    for (let i = 0; i < this._canvases.getSize(); i++) {
      const subdelegate = new AppSubdelegate();
      const result = subdelegate.initialize(this._canvases.at(i));
      if (!result) {
        logger.error('Failed to initialize AppSubdelegate');
        return;
      }
      this._subdelegates.pushBack(subdelegate);
    }

    // Check if the WebGL context of each subdelegate is lost
    for (let i = 0; i < LAppDefine.CanvasNum; i++) {
      if (this._subdelegates.at(i).isContextLost()) {
        logger.error(
          `The context for Canvas at index ${i} was lost, possibly because the acquisition limit for WebGLRenderingContext was reached.`
        );
      }
    }
  }

  /**
   * Switch model
   * @param {string} modelSettingPath Path to the model setting file
   */
  changeModel(modelSettingPath) {
    const segments = modelSettingPath.split('/');
    const modelJsonName = segments.pop();
    const modelPath = segments.join('/') + '/';
    // Get the current Live2D manager
    const live2dManager = this._subdelegates.at(0).getLive2DManager();
    // Release all old models
    live2dManager.releaseAllModel();
    // Create a new model instance, set subdelegate and load resources
    const instance = new LAppModel();
    instance.setSubdelegate(live2dManager._subdelegate);
    instance.loadAssets(modelPath, modelJsonName);
    // Add the new model to the model list
    live2dManager._models.pushBack(instance);
  }

  get subdelegates() {
    return this._subdelegates;
  }
}
