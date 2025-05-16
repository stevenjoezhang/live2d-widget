/* global document, window, Live2D */
import { L2DMatrix44, L2DTargetPoint, L2DViewMatrix } from './Live2DFramework';
import LAppDefine from './LAppDefine';
import MatrixStack from './utils/MatrixStack';
import LAppLive2DManager from './LAppLive2DManager';
import logger from '../logger';

class Model {
  constructor() {
    this.live2DMgr = new LAppLive2DManager();

    this.isDrawStart = false;

    this.gl = null;
    this.canvas = null;

    this.dragMgr = null; /*new L2DTargetPoint();*/
    this.viewMatrix = null; /*new L2DViewMatrix();*/
    this.projMatrix = null; /*new L2DMatrix44()*/
    this.deviceToScreen = null; /*new L2DMatrix44();*/

    this.drag = false;
    this.oldLen = 0;

    this.lastMouseX = 0;
    this.lastMouseY = 0;
  }

  initL2dCanvas(canvasId) {
    this.canvas = document.getElementById(canvasId);

    if (this.canvas.addEventListener) {
      this.canvas.addEventListener('mousewheel', this.mouseEvent.bind(this), false);
      this.canvas.addEventListener('click', this.mouseEvent.bind(this), false);

      this.canvas.addEventListener('mousedown', this.mouseEvent.bind(this), false);
      this.canvas.addEventListener('mousemove', this.mouseEvent.bind(this), false);

      this.canvas.addEventListener('mouseup', this.mouseEvent.bind(this), false);
      this.canvas.addEventListener('mouseout', this.mouseEvent.bind(this), false);
      this.canvas.addEventListener('contextmenu', this.mouseEvent.bind(this), false);

      this.canvas.addEventListener('touchstart', this.touchEvent.bind(this), false);
      this.canvas.addEventListener('touchend', this.touchEvent.bind(this), false);
      this.canvas.addEventListener('touchmove', this.touchEvent.bind(this), false);
    }
  }

  async init(canvasId, modelSettingPath) {
    this.initL2dCanvas(canvasId);
    const width = this.canvas.width;
    const height = this.canvas.height;

    this.dragMgr = new L2DTargetPoint();

    const ratio = height / width;
    const left = LAppDefine.VIEW_LOGICAL_LEFT;
    const right = LAppDefine.VIEW_LOGICAL_RIGHT;
    const bottom = -ratio;
    const top = ratio;

    this.viewMatrix = new L2DViewMatrix();

    this.viewMatrix.setScreenRect(left, right, bottom, top);

    this.viewMatrix.setMaxScreenRect(
      LAppDefine.VIEW_LOGICAL_MAX_LEFT,
      LAppDefine.VIEW_LOGICAL_MAX_RIGHT,
      LAppDefine.VIEW_LOGICAL_MAX_BOTTOM,
      LAppDefine.VIEW_LOGICAL_MAX_TOP,
    );

    this.viewMatrix.setMaxScale(LAppDefine.VIEW_MAX_SCALE);
    this.viewMatrix.setMinScale(LAppDefine.VIEW_MIN_SCALE);

    this.projMatrix = new L2DMatrix44();
    this.projMatrix.multScale(1, width / height);

    this.deviceToScreen = new L2DMatrix44();
    this.deviceToScreen.multTranslate(-width / 2.0, -height / 2.0);
    this.deviceToScreen.multScale(2 / width, -2 / width);

    // https://stackoverflow.com/questions/26783586/canvas-todataurl-returns-blank-image
    this.gl = this.canvas.getContext('webgl', { premultipliedAlpha: true, preserveDrawingBuffer: true });
    if (!this.gl) {
      logger.error('Failed to create WebGL context.');
      return;
    }

    Live2D.setGL(this.gl);

    this.gl.clearColor(0.0, 0.0, 0.0, 0.0);

    await this.changeModel(modelSettingPath);

    this.startDraw();
  }

  startDraw() {
    if (!this.isDrawStart) {
      this.isDrawStart = true;
      const tick = () => {
        this.draw();

        const requestAnimationFrame =
          window.requestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.msRequestAnimationFrame;

        requestAnimationFrame(tick, this.canvas);
      };
      tick();
    }
  }

  draw() {
    // logger.trace("--> draw()");

    MatrixStack.reset();
    MatrixStack.loadIdentity();

    this.dragMgr.update();
    this.live2DMgr.setDrag(this.dragMgr.getX(), this.dragMgr.getY());

    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    MatrixStack.multMatrix(this.projMatrix.getArray());
    MatrixStack.multMatrix(this.viewMatrix.getArray());
    MatrixStack.push();

    const model = this.live2DMgr.getModel();

    if (model == null) return;

    if (model.initialized && !model.updating) {
      model.update();
      model.draw(this.gl);
    }

    MatrixStack.pop();
  }

  async changeModel(modelSettingPath) {
    await this.live2DMgr.changeModel(this.gl, modelSettingPath);
  }

  modelScaling(scale) {
    const isMaxScale = this.viewMatrix.isMaxScale();
    const isMinScale = this.viewMatrix.isMinScale();

    this.viewMatrix.adjustScale(0, 0, scale);

    if (!isMaxScale) {
      if (this.viewMatrix.isMaxScale()) {
        this.live2DMgr.maxScaleEvent();
      }
    }

    if (!isMinScale) {
      if (this.viewMatrix.isMinScale()) {
        this.live2DMgr.minScaleEvent();
      }
    }
  }

  modelTurnHead(event) {
    this.drag = true;

    const rect = event.target.getBoundingClientRect();

    const sx = this.transformScreenX(event.clientX - rect.left);
    const sy = this.transformScreenY(event.clientY - rect.top);
    const vx = this.transformViewX(event.clientX - rect.left);
    const vy = this.transformViewY(event.clientY - rect.top);

    if (LAppDefine.DEBUG_MOUSE_LOG)
      logger.trace(
        'onMouseDown device( x:' +
        event.clientX +
        ' y:' +
        event.clientY +
        ' ) view( x:' +
        vx +
        ' y:' +
        vy +
        ')',
      );

    this.lastMouseX = sx;
    this.lastMouseY = sy;

    this.dragMgr.setPoint(vx, vy);

    this.live2DMgr.tapEvent(vx, vy);
  }

  followPointer(event) {
    const rect = event.target.getBoundingClientRect();

    const sx = this.transformScreenX(event.clientX - rect.left);
    const sy = this.transformScreenY(event.clientY - rect.top);
    const vx = this.transformViewX(event.clientX - rect.left);
    const vy = this.transformViewY(event.clientY - rect.top);

    if (LAppDefine.DEBUG_MOUSE_LOG)
      logger.trace(
        'onMouseMove device( x:' +
        event.clientX +
        ' y:' +
        event.clientY +
        ' ) view( x:' +
        vx +
        ' y:' +
        vy +
        ')',
      );

    if (this.drag) {
      this.lastMouseX = sx;
      this.lastMouseY = sy;

      this.dragMgr.setPoint(vx, vy);
    }
  }

  lookFront() {
    if (this.drag) {
      this.drag = false;
    }

    this.dragMgr.setPoint(0, 0);
  }

  mouseEvent(e) {
    e.preventDefault();

    if (e.type == 'mousewheel') {
      if (
        e.clientX < 0 ||
        this.canvas.clientWidth < e.clientX ||
        e.clientY < 0 ||
        this.canvas.clientHeight < e.clientY
      ) {
        return;
      }

      if (e.wheelDelta > 0) this.modelScaling(1.1);
      else this.modelScaling(0.9);
    } else if (e.type == 'mousedown') {
      if ('button' in e && e.button != 0) return;

      this.modelTurnHead(e);
    } else if (e.type == 'mousemove') {
      this.followPointer(e);
    } else if (e.type == 'mouseup') {
      if ('button' in e && e.button != 0) return;

      this.lookFront();
    } else if (e.type == 'mouseout') {
      this.lookFront();
    }
  }

  touchEvent(e) {
    e.preventDefault();

    const touch = e.touches[0];

    if (e.type == 'touchstart') {
      if (e.touches.length == 1) this.modelTurnHead(touch);
      // onClick(touch);
    } else if (e.type == 'touchmove') {
      this.followPointer(touch);

      if (e.touches.length == 2) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];

        const len =
          Math.pow(touch1.pageX - touch2.pageX, 2) +
          Math.pow(touch1.pageY - touch2.pageY, 2);
        if (this.oldLen - len < 0) this.modelScaling(1.025);
        else this.modelScaling(0.975);

        this.oldLen = len;
      }
    } else if (e.type == 'touchend') {
      this.lookFront();
    }
  }

  transformViewX(deviceX) {
    const screenX = this.deviceToScreen.transformX(deviceX);
    return this.viewMatrix.invertTransformX(screenX);
  }

  transformViewY(deviceY) {
    const screenY = this.deviceToScreen.transformY(deviceY);
    return this.viewMatrix.invertTransformY(screenY);
  }

  transformScreenX(deviceX) {
    return this.deviceToScreen.transformX(deviceX);
  }

  transformScreenY(deviceY) {
    return this.deviceToScreen.transformY(deviceY);
  }
}

export default Model;
