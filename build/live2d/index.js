var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { L2DMatrix44, L2DTargetPoint, L2DViewMatrix } from './Live2DFramework';
import LAppDefine from './LAppDefine';
import MatrixStack from './utils/MatrixStack';
import LAppLive2DManager from './LAppLive2DManager';
var Model = (function () {
    function Model() {
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
    }
    Model.prototype.initL2dCanvas = function (canvasId) {
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
    };
    Model.prototype.init = function (canvasId, modelSettingPath) {
        return __awaiter(this, void 0, void 0, function () {
            var width, height, ratio, left, right, bottom, top;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.initL2dCanvas(canvasId);
                        width = this.canvas.width;
                        height = this.canvas.height;
                        this.dragMgr = new L2DTargetPoint();
                        ratio = height / width;
                        left = LAppDefine.VIEW_LOGICAL_LEFT;
                        right = LAppDefine.VIEW_LOGICAL_RIGHT;
                        bottom = -ratio;
                        top = ratio;
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
                        this.gl = this.canvas.getContext('webgl', { premultipliedAlpha: true, preserveDrawingBuffer: true });
                        if (!this.gl) {
                            console.error('Failed to create WebGL context.');
                            return [2];
                        }
                        Live2D.setGL(this.gl);
                        this.gl.clearColor(0.0, 0.0, 0.0, 0.0);
                        return [4, this.changeModel(modelSettingPath)];
                    case 1:
                        _a.sent();
                        this.startDraw();
                        return [2];
                }
            });
        });
    };
    Model.prototype.startDraw = function () {
        var _this = this;
        if (!this.isDrawStart) {
            this.isDrawStart = true;
            var tick_1 = function () {
                _this.draw();
                var requestAnimationFrame = window.requestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.msRequestAnimationFrame;
                requestAnimationFrame(tick_1, _this.canvas);
            };
            tick_1();
        }
    };
    Model.prototype.draw = function () {
        MatrixStack.reset();
        MatrixStack.loadIdentity();
        this.dragMgr.update();
        this.live2DMgr.setDrag(this.dragMgr.getX(), this.dragMgr.getY());
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        MatrixStack.multMatrix(this.projMatrix.getArray());
        MatrixStack.multMatrix(this.viewMatrix.getArray());
        MatrixStack.push();
        var model = this.live2DMgr.getModel();
        if (model == null)
            return;
        if (model.initialized && !model.updating) {
            model.update();
            model.draw(this.gl);
        }
        MatrixStack.pop();
    };
    Model.prototype.changeModel = function (modelSettingPath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.live2DMgr.changeModel(this.gl, modelSettingPath)];
                    case 1:
                        _a.sent();
                        return [2];
                }
            });
        });
    };
    Model.prototype.modelScaling = function (scale) {
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
    };
    Model.prototype.modelTurnHead = function (event) {
        this.drag = true;
        var rect = event.target.getBoundingClientRect();
        var sx = this.transformScreenX(event.clientX - rect.left);
        var sy = this.transformScreenY(event.clientY - rect.top);
        var vx = this.transformViewX(event.clientX - rect.left);
        var vy = this.transformViewY(event.clientY - rect.top);
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
    };
    Model.prototype.followPointer = function (event) {
        var rect = event.target.getBoundingClientRect();
        var sx = this.transformScreenX(event.clientX - rect.left);
        var sy = this.transformScreenY(event.clientY - rect.top);
        var vx = this.transformViewX(event.clientX - rect.left);
        var vy = this.transformViewY(event.clientY - rect.top);
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
    };
    Model.prototype.lookFront = function () {
        if (this.drag) {
            this.drag = false;
        }
        this.dragMgr.setPoint(0, 0);
    };
    Model.prototype.mouseEvent = function (e) {
        e.preventDefault();
        if (e.type == 'mousewheel') {
            if (e.clientX < 0 ||
                this.canvas.clientWidth < e.clientX ||
                e.clientY < 0 ||
                this.canvas.clientHeight < e.clientY) {
                return;
            }
            if (e.wheelDelta > 0)
                this.modelScaling(1.1);
            else
                this.modelScaling(0.9);
        }
        else if (e.type == 'mousedown') {
            if ('button' in e && e.button != 0)
                return;
            this.modelTurnHead(e);
        }
        else if (e.type == 'mousemove') {
            this.followPointer(e);
        }
        else if (e.type == 'mouseup') {
            if ('button' in e && e.button != 0)
                return;
            this.lookFront();
        }
        else if (e.type == 'mouseout') {
            this.lookFront();
        }
    };
    Model.prototype.touchEvent = function (e) {
        e.preventDefault();
        var touch = e.touches[0];
        if (e.type == 'touchstart') {
            if (e.touches.length == 1)
                this.modelTurnHead(touch);
        }
        else if (e.type == 'touchmove') {
            this.followPointer(touch);
            if (e.touches.length == 2) {
                var touch1 = e.touches[0];
                var touch2 = e.touches[1];
                var len = Math.pow(touch1.pageX - touch2.pageX, 2) +
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
    };
    Model.prototype.transformViewX = function (deviceX) {
        var screenX = this.deviceToScreen.transformX(deviceX);
        return this.viewMatrix.invertTransformX(screenX);
    };
    Model.prototype.transformViewY = function (deviceY) {
        var screenY = this.deviceToScreen.transformY(deviceY);
        return this.viewMatrix.invertTransformY(screenY);
    };
    Model.prototype.transformScreenX = function (deviceX) {
        return this.deviceToScreen.transformX(deviceX);
    };
    Model.prototype.transformScreenY = function (deviceY) {
        return this.deviceToScreen.transformY(deviceY);
    };
    return Model;
}());
function l2dLog(msg) {
    if (!LAppDefine.DEBUG_LOG)
        return;
    var myconsole = document.getElementById('myconsole');
    myconsole.innerHTML = myconsole.innerHTML + '<br>' + msg;
    console.log(msg);
}
export default Model;
