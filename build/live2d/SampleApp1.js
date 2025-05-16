import { L2DMatrix44, L2DTargetPoint, L2DViewMatrix } from './Live2DFramework';
import LAppDefine from './LAppDefine';
import MatrixStack from './utils/MatrixStack';
import LAppLive2DManager from './LAppLive2DManager';
window.onerror = function (msg, url, line, col, error) {
    var errmsg = 'file:' + url + '<br>line:' + line + ' ' + msg;
    l2dError(errmsg);
};
function sampleApp1() {
    this.platform = window.navigator.platform.toLowerCase();
    this.live2DMgr = new LAppLive2DManager();
    this.isDrawStart = false;
    this.gl = null;
    this.canvas = null;
    this.dragMgr = null;
    this.viewMatrix = null;
    this.projMatrix = null;
    this.deviceToScreen = null;
    this.drag = false;
    this.oldLen = 0;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.isModelShown = false;
    initL2dCanvas('glcanvas');
    init();
}
function initL2dCanvas(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (this.canvas.addEventListener) {
        this.canvas.addEventListener('mousewheel', mouseEvent, false);
        this.canvas.addEventListener('click', mouseEvent, false);
        this.canvas.addEventListener('mousedown', mouseEvent, false);
        this.canvas.addEventListener('mousemove', mouseEvent, false);
        this.canvas.addEventListener('mouseup', mouseEvent, false);
        this.canvas.addEventListener('mouseout', mouseEvent, false);
        this.canvas.addEventListener('contextmenu', mouseEvent, false);
        this.canvas.addEventListener('touchstart', touchEvent, false);
        this.canvas.addEventListener('touchend', touchEvent, false);
        this.canvas.addEventListener('touchmove', touchEvent, false);
    }
    var btnChangeModel = document.getElementById('btnChange');
    btnChangeModel.addEventListener('click', function (e) {
        changeModel();
    });
}
function init() {
    var width = this.canvas.width;
    var height = this.canvas.height;
    this.dragMgr = new L2DTargetPoint();
    var ratio = height / width;
    var left = LAppDefine.VIEW_LOGICAL_LEFT;
    var right = LAppDefine.VIEW_LOGICAL_RIGHT;
    var bottom = -ratio;
    var top = ratio;
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
    this.gl = getWebGLContext();
    if (!this.gl) {
        l2dError('Failed to create WebGL context.');
        return;
    }
    Live2D.setGL(this.gl);
    this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
    changeModel();
    startDraw();
}
function startDraw() {
    if (!this.isDrawStart) {
        this.isDrawStart = true;
        (function tick() {
            draw();
            var requestAnimationFrame = window.requestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.msRequestAnimationFrame;
            requestAnimationFrame(tick, this.canvas);
        })();
    }
}
function draw() {
    MatrixStack.reset();
    MatrixStack.loadIdentity();
    this.dragMgr.update();
    this.live2DMgr.setDrag(this.dragMgr.getX(), this.dragMgr.getY());
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    MatrixStack.multMatrix(this.projMatrix.getArray());
    MatrixStack.multMatrix(this.viewMatrix.getArray());
    MatrixStack.push();
    for (var i = 0; i < this.live2DMgr.numModels(); i++) {
        var model = this.live2DMgr.getModel(i);
        if (model == null)
            return;
        if (model.initialized && !model.updating) {
            model.update();
            model.draw(this.gl);
            if (!this.isModelShown && i == this.live2DMgr.numModels() - 1) {
                this.isModelShown = !this.isModelShown;
                var btnChange = document.getElementById('btnChange');
                btnChange.textContent = 'Change Model';
                btnChange.removeAttribute('disabled');
                btnChange.setAttribute('class', 'active');
            }
        }
    }
    MatrixStack.pop();
}
function changeModel() {
    var btnChange = document.getElementById('btnChange');
    btnChange.setAttribute('disabled', 'disabled');
    btnChange.setAttribute('class', 'inactive');
    btnChange.textContent = 'Now Loading...';
    this.isModelShown = false;
    this.live2DMgr.reloadFlg = true;
    this.live2DMgr.count++;
    this.live2DMgr.changeModel(this.gl);
}
function modelScaling(scale) {
    var isMaxScale = this.viewMatrix.isMaxScale();
    var isMinScale = this.viewMatrix.isMinScale();
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
function modelTurnHead(event) {
    this.drag = true;
    var rect = event.target.getBoundingClientRect();
    var sx = transformScreenX(event.clientX - rect.left);
    var sy = transformScreenY(event.clientY - rect.top);
    var vx = transformViewX(event.clientX - rect.left);
    var vy = transformViewY(event.clientY - rect.top);
    if (LAppDefine.DEBUG_MOUSE_LOG)
        l2dLog('onMouseDown device( x:' +
            event.clientX +
            ' y:' +
            event.clientY +
            ' ) view( x:' +
            vx +
            ' y:' +
            vy +
            ')');
    this.lastMouseX = sx;
    this.lastMouseY = sy;
    this.dragMgr.setPoint(vx, vy);
    this.live2DMgr.tapEvent(vx, vy);
}
function followPointer(event) {
    var rect = event.target.getBoundingClientRect();
    var sx = transformScreenX(event.clientX - rect.left);
    var sy = transformScreenY(event.clientY - rect.top);
    var vx = transformViewX(event.clientX - rect.left);
    var vy = transformViewY(event.clientY - rect.top);
    if (LAppDefine.DEBUG_MOUSE_LOG)
        l2dLog('onMouseMove device( x:' +
            event.clientX +
            ' y:' +
            event.clientY +
            ' ) view( x:' +
            vx +
            ' y:' +
            vy +
            ')');
    if (this.drag) {
        this.lastMouseX = sx;
        this.lastMouseY = sy;
        this.dragMgr.setPoint(vx, vy);
    }
}
function lookFront() {
    if (this.drag) {
        this.drag = false;
    }
    this.dragMgr.setPoint(0, 0);
}
function mouseEvent(e) {
    e.preventDefault();
    if (e.type == 'mousewheel') {
        if (e.clientX < 0 ||
            this.canvas.clientWidth < e.clientX ||
            e.clientY < 0 ||
            this.canvas.clientHeight < e.clientY) {
            return;
        }
        if (e.wheelDelta > 0)
            modelScaling(1.1);
        else
            modelScaling(0.9);
    }
    else if (e.type == 'mousedown') {
        if ('button' in e && e.button != 0)
            return;
        modelTurnHead(e);
    }
    else if (e.type == 'mousemove') {
        followPointer(e);
    }
    else if (e.type == 'mouseup') {
        if ('button' in e && e.button != 0)
            return;
        lookFront();
    }
    else if (e.type == 'mouseout') {
        lookFront();
    }
    else if (e.type == 'contextmenu') {
        changeModel();
    }
}
function touchEvent(e) {
    e.preventDefault();
    var touch = e.touches[0];
    if (e.type == 'touchstart') {
        if (e.touches.length == 1)
            modelTurnHead(touch);
    }
    else if (e.type == 'touchmove') {
        followPointer(touch);
        if (e.touches.length == 2) {
            var touch1 = e.touches[0];
            var touch2 = e.touches[1];
            var len = Math.pow(touch1.pageX - touch2.pageX, 2) +
                Math.pow(touch1.pageY - touch2.pageY, 2);
            if (this.oldLen - len < 0)
                modelScaling(1.025);
            else
                modelScaling(0.975);
            this.oldLen = len;
        }
    }
    else if (e.type == 'touchend') {
        lookFront();
    }
}
function transformViewX(deviceX) {
    var screenX = this.deviceToScreen.transformX(deviceX);
    return this.viewMatrix.invertTransformX(screenX);
}
function transformViewY(deviceY) {
    var screenY = this.deviceToScreen.transformY(deviceY);
    return this.viewMatrix.invertTransformY(screenY);
}
function transformScreenX(deviceX) {
    return this.deviceToScreen.transformX(deviceX);
}
function transformScreenY(deviceY) {
    return this.deviceToScreen.transformY(deviceY);
}
function getWebGLContext() {
    var NAMES = ['webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl'];
    for (var i = 0; i < NAMES.length; i++) {
        try {
            var ctx = this.canvas.getContext(NAMES[i], { premultipliedAlpha: true });
            if (ctx)
                return ctx;
        }
        catch (_a) {
            ;
        }
    }
    return null;
}
function l2dLog(msg) {
    if (!LAppDefine.DEBUG_LOG)
        return;
    var myconsole = document.getElementById('myconsole');
    myconsole.innerHTML = myconsole.innerHTML + '<br>' + msg;
    console.log(msg);
}
function l2dError(msg) {
    if (!LAppDefine.DEBUG_LOG)
        return;
    l2dLog('<span style=\'color:red\'>' + msg + '</span>');
    console.error(msg);
}
