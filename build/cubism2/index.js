import { L2DMatrix44, L2DTargetPoint, L2DViewMatrix } from './Live2DFramework.js';
import LAppDefine from './LAppDefine.js';
import MatrixStack from './utils/MatrixStack.js';
import LAppLive2DManager from './LAppLive2DManager.js';
import logger from '../logger.js';
function normalizePoint(x, y, x0, y0, w, h) {
    const dx = x - x0;
    const dy = y - y0;
    let targetX = 0, targetY = 0;
    if (dx >= 0) {
        targetX = dx / (w - x0);
    }
    else {
        targetX = dx / x0;
    }
    if (dy >= 0) {
        targetY = dy / (h - y0);
    }
    else {
        targetY = dy / y0;
    }
    return {
        vx: targetX,
        vy: -targetY
    };
}
class Cubism2Model {
    constructor() {
        this.live2DMgr = new LAppLive2DManager();
        this.isDrawStart = false;
        this.gl = null;
        this.canvas = null;
        this.dragMgr = null;
        this.viewMatrix = null;
        this.projMatrix = null;
        this.deviceToScreen = null;
        this.oldLen = 0;
        this._boundMouseEvent = this.mouseEvent.bind(this);
        this._boundTouchEvent = this.touchEvent.bind(this);
    }
    initL2dCanvas(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (this.canvas.addEventListener) {
            this.canvas.addEventListener('mousewheel', this._boundMouseEvent, false);
            this.canvas.addEventListener('click', this._boundMouseEvent, false);
            document.addEventListener('mousemove', this._boundMouseEvent, false);
            document.addEventListener('mouseout', this._boundMouseEvent, false);
            this.canvas.addEventListener('contextmenu', this._boundMouseEvent, false);
            this.canvas.addEventListener('touchstart', this._boundTouchEvent, false);
            this.canvas.addEventListener('touchend', this._boundTouchEvent, false);
            this.canvas.addEventListener('touchmove', this._boundTouchEvent, false);
        }
    }
    async init(canvasId, modelSettingPath, modelSetting) {
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
        this.viewMatrix.setMaxScreenRect(LAppDefine.VIEW_LOGICAL_MAX_LEFT, LAppDefine.VIEW_LOGICAL_MAX_RIGHT, LAppDefine.VIEW_LOGICAL_MAX_BOTTOM, LAppDefine.VIEW_LOGICAL_MAX_TOP);
        this.viewMatrix.setMaxScale(LAppDefine.VIEW_MAX_SCALE);
        this.viewMatrix.setMinScale(LAppDefine.VIEW_MIN_SCALE);
        this.projMatrix = new L2DMatrix44();
        this.projMatrix.multScale(1, width / height);
        this.deviceToScreen = new L2DMatrix44();
        this.deviceToScreen.multTranslate(-width / 2.0, -height / 2.0);
        this.deviceToScreen.multScale(2 / width, -2 / width);
        this.gl = this.canvas.getContext('webgl2', { premultipliedAlpha: true, preserveDrawingBuffer: true });
        if (!this.gl) {
            logger.error('Failed to create WebGL context.');
            return;
        }
        Live2D.setGL(this.gl);
        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
        await this.changeModelWithJSON(modelSettingPath, modelSetting);
        this.startDraw();
    }
    destroy() {
        if (this.canvas) {
            this.canvas.removeEventListener('mousewheel', this._boundMouseEvent, false);
            this.canvas.removeEventListener('click', this._boundMouseEvent, false);
            document.removeEventListener('mousemove', this._boundMouseEvent, false);
            document.removeEventListener('mouseout', this._boundMouseEvent, false);
            this.canvas.removeEventListener('contextmenu', this._boundMouseEvent, false);
            this.canvas.removeEventListener('touchstart', this._boundTouchEvent, false);
            this.canvas.removeEventListener('touchend', this._boundTouchEvent, false);
            this.canvas.removeEventListener('touchmove', this._boundTouchEvent, false);
        }
        if (this._drawFrameId) {
            window.cancelAnimationFrame(this._drawFrameId);
            this._drawFrameId = null;
        }
        this.isDrawStart = false;
        if (this.live2DMgr && typeof this.live2DMgr.release === 'function') {
            this.live2DMgr.release();
        }
        if (this.gl) {
        }
        this.canvas = null;
        this.gl = null;
        this.dragMgr = null;
        this.viewMatrix = null;
        this.projMatrix = null;
        this.deviceToScreen = null;
    }
    startDraw() {
        if (!this.isDrawStart) {
            this.isDrawStart = true;
            const tick = () => {
                this.draw();
                this._drawFrameId = window.requestAnimationFrame(tick, this.canvas);
            };
            tick();
        }
    }
    draw() {
        MatrixStack.reset();
        MatrixStack.loadIdentity();
        this.dragMgr.update();
        this.live2DMgr.setDrag(this.dragMgr.getX(), this.dragMgr.getY());
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        MatrixStack.multMatrix(this.projMatrix.getArray());
        MatrixStack.multMatrix(this.viewMatrix.getArray());
        MatrixStack.push();
        const model = this.live2DMgr.getModel();
        if (model == null)
            return;
        if (model.initialized && !model.updating) {
            model.update();
            model.draw(this.gl);
        }
        MatrixStack.pop();
    }
    async changeModel(modelSettingPath) {
        await this.live2DMgr.changeModel(this.gl, modelSettingPath);
    }
    async changeModelWithJSON(modelSettingPath, modelSetting) {
        await this.live2DMgr.changeModelWithJSON(this.gl, modelSettingPath, modelSetting);
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
        var _b;
        const rect = this.canvas.getBoundingClientRect();
        const { vx, vy } = normalizePoint(event.clientX, event.clientY, rect.left + rect.width / 2, rect.top + rect.height / 2, window.innerWidth, window.innerHeight);
        logger.trace('onMouseDown device( x:' +
            event.clientX +
            ' y:' +
            event.clientY +
            ' ) view( x:' +
            vx +
            ' y:' +
            vy +
            ')');
        this.dragMgr.setPoint(vx, vy);
        this.live2DMgr.tapEvent(vx, vy);
        if ((_b = this.live2DMgr) === null || _b === void 0 ? void 0 : _b.model.hitTest(LAppDefine.HIT_AREA_BODY, vx, vy)) {
            window.dispatchEvent(new Event('live2d:tapbody'));
        }
    }
    followPointer(event) {
        var _b;
        const rect = this.canvas.getBoundingClientRect();
        const { vx, vy } = normalizePoint(event.clientX, event.clientY, rect.left + rect.width / 2, rect.top + rect.height / 2, window.innerWidth, window.innerHeight);
        logger.trace('onMouseMove device( x:' +
            event.clientX +
            ' y:' +
            event.clientY +
            ' ) view( x:' +
            vx +
            ' y:' +
            vy +
            ')');
        this.dragMgr.setPoint(vx, vy);
        if ((_b = this.live2DMgr) === null || _b === void 0 ? void 0 : _b.model.hitTest(LAppDefine.HIT_AREA_BODY, vx, vy)) {
            window.dispatchEvent(new Event('live2d:hoverbody'));
        }
    }
    lookFront() {
        this.dragMgr.setPoint(0, 0);
    }
    mouseEvent(e) {
        e.preventDefault();
        if (e.type == 'mousewheel') {
            if (e.wheelDelta > 0)
                this.modelScaling(1.1);
            else
                this.modelScaling(1);
        }
        else if (e.type == 'click' || e.type == 'contextmenu') {
            this.modelTurnHead(e);
        }
        else if (e.type == 'mousemove') {
            this.followPointer(e);
        }
        else if (e.type == 'mouseout') {
            this.lookFront();
        }
    }
    touchEvent(e) {
        e.preventDefault();
        const touch = e.touches[0];
        if (e.type == 'touchstart') {
            if (e.touches.length == 1)
                this.modelTurnHead(touch);
        }
        else if (e.type == 'touchmove') {
            this.followPointer(touch);
            if (e.touches.length == 2) {
                const touch1 = e.touches[0];
                const touch2 = e.touches[1];
                const len = Math.pow(touch1.pageX - touch2.pageX, 2) +
                    Math.pow(touch1.pageY - touch2.pageY, 2);
                if (this.oldLen - len < 0)
                    this.modelScaling(1.025);
                else
                    this.modelScaling(0.975);
                this.oldLen = len;
            }
        }
        else if (e.type == 'touchend') {
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
export default Cubism2Model;
