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
import { Live2DFramework } from './Live2DFramework';
import LAppModel from './LAppModel';
import PlatformManager from './PlatformManager';
import LAppDefine from './LAppDefine';
import logger from '../logger';
var LAppLive2DManager = (function () {
    function LAppLive2DManager() {
        this.model = null;
        this.reloading = false;
        Live2D.init();
        Live2DFramework.setPlatformManager(new PlatformManager());
    }
    LAppLive2DManager.prototype.getModel = function () {
        return this.model;
    };
    LAppLive2DManager.prototype.releaseModel = function (gl) {
        if (this.model) {
            this.model.release(gl);
            this.model = null;
        }
    };
    LAppLive2DManager.prototype.changeModel = function (gl, modelSettingPath) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, new Promise(function (resolve, reject) {
                        if (_this.reloading)
                            return;
                        _this.reloading = true;
                        var oldModel = _this.model;
                        var newModel = new LAppModel();
                        newModel.load(gl, modelSettingPath, function () {
                            if (oldModel) {
                                oldModel.release(gl);
                            }
                            _this.model = newModel;
                            _this.reloading = false;
                            resolve();
                        });
                    })];
            });
        });
    };
    LAppLive2DManager.prototype.changeModelWithJSON = function (gl, modelSettingPath, modelSetting) {
        return __awaiter(this, void 0, void 0, function () {
            var oldModel, newModel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.reloading)
                            return [2];
                        this.reloading = true;
                        oldModel = this.model;
                        newModel = new LAppModel();
                        return [4, newModel.loadModelSetting(modelSettingPath, modelSetting)];
                    case 1:
                        _a.sent();
                        if (oldModel) {
                            oldModel.release(gl);
                        }
                        this.model = newModel;
                        this.reloading = false;
                        return [2];
                }
            });
        });
    };
    LAppLive2DManager.prototype.setDrag = function (x, y) {
        if (this.model) {
            this.model.setDrag(x, y);
        }
    };
    LAppLive2DManager.prototype.maxScaleEvent = function () {
        logger.trace('Max scale event.');
        if (this.model) {
            this.model.startRandomMotion(LAppDefine.MOTION_GROUP_PINCH_IN, LAppDefine.PRIORITY_NORMAL);
        }
    };
    LAppLive2DManager.prototype.minScaleEvent = function () {
        logger.trace('Min scale event.');
        if (this.model) {
            this.model.startRandomMotion(LAppDefine.MOTION_GROUP_PINCH_OUT, LAppDefine.PRIORITY_NORMAL);
        }
    };
    LAppLive2DManager.prototype.tapEvent = function (x, y) {
        logger.trace('tapEvent view x:' + x + ' y:' + y);
        if (!this.model)
            return false;
        if (this.model.hitTest(LAppDefine.HIT_AREA_HEAD, x, y)) {
            logger.trace('Tap face.');
            this.model.setRandomExpression();
        }
        else if (this.model.hitTest(LAppDefine.HIT_AREA_BODY, x, y)) {
            logger.trace('Tap body.');
            this.model.startRandomMotion(LAppDefine.MOTION_GROUP_TAP_BODY, LAppDefine.PRIORITY_NORMAL);
        }
        return true;
    };
    return LAppLive2DManager;
}());
export default LAppLive2DManager;
