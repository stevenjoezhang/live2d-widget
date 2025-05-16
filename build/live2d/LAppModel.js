var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { L2DBaseModel, Live2DFramework, L2DEyeBlink } from './Live2DFramework';
import ModelSettingJson from './utils/ModelSettingJson';
import LAppDefine from './LAppDefine';
import MatrixStack from './utils/MatrixStack';
var LAppModel = (function (_super) {
    __extends(LAppModel, _super);
    function LAppModel() {
        var _this = _super.call(this) || this;
        _this.modelHomeDir = '';
        _this.modelSetting = null;
        _this.tmpMatrix = [];
        return _this;
    }
    LAppModel.prototype.load = function (gl, modelSettingPath, callback) {
        var _this = this;
        this.setUpdating(true);
        this.setInitialized(false);
        this.modelHomeDir = modelSettingPath.substring(0, modelSettingPath.lastIndexOf('/') + 1);
        this.modelSetting = new ModelSettingJson();
        this.modelSetting.loadModelSetting(modelSettingPath, function () {
            var path = _this.modelHomeDir + _this.modelSetting.getModelFile();
            _this.loadModelData(path, function (model) {
                for (var i = 0; i < _this.modelSetting.getTextureNum(); i++) {
                    var texPaths = _this.modelHomeDir + _this.modelSetting.getTextureFile(i);
                    _this.loadTexture(i, texPaths, function () {
                        if (_this.isTexLoaded) {
                            if (_this.modelSetting.getExpressionNum() > 0) {
                                _this.expressions = {};
                                for (var j = 0; j < _this.modelSetting.getExpressionNum(); j++) {
                                    var expName = _this.modelSetting.getExpressionName(j);
                                    var expFilePath = _this.modelHomeDir +
                                        _this.modelSetting.getExpressionFile(j);
                                    _this.loadExpression(expName, expFilePath);
                                }
                            }
                            else {
                                _this.expressionManager = null;
                                _this.expressions = {};
                            }
                            if (_this.eyeBlink == null) {
                                _this.eyeBlink = new L2DEyeBlink();
                            }
                            if (_this.modelSetting.getPhysicsFile() != null) {
                                _this.loadPhysics(_this.modelHomeDir + _this.modelSetting.getPhysicsFile());
                            }
                            else {
                                _this.physics = null;
                            }
                            if (_this.modelSetting.getPoseFile() != null) {
                                _this.loadPose(_this.modelHomeDir + _this.modelSetting.getPoseFile(), function () {
                                    _this.pose.updateParam(_this.live2DModel);
                                });
                            }
                            else {
                                _this.pose = null;
                            }
                            if (_this.modelSetting.getLayout() != null) {
                                var layout = _this.modelSetting.getLayout();
                                if (layout['width'] != null)
                                    _this.modelMatrix.setWidth(layout['width']);
                                if (layout['height'] != null)
                                    _this.modelMatrix.setHeight(layout['height']);
                                if (layout['x'] != null)
                                    _this.modelMatrix.setX(layout['x']);
                                if (layout['y'] != null)
                                    _this.modelMatrix.setY(layout['y']);
                                if (layout['center_x'] != null)
                                    _this.modelMatrix.centerX(layout['center_x']);
                                if (layout['center_y'] != null)
                                    _this.modelMatrix.centerY(layout['center_y']);
                                if (layout['top'] != null)
                                    _this.modelMatrix.top(layout['top']);
                                if (layout['bottom'] != null)
                                    _this.modelMatrix.bottom(layout['bottom']);
                                if (layout['left'] != null)
                                    _this.modelMatrix.left(layout['left']);
                                if (layout['right'] != null)
                                    _this.modelMatrix.right(layout['right']);
                            }
                            for (var j = 0; j < _this.modelSetting.getInitParamNum(); j++) {
                                _this.live2DModel.setParamFloat(_this.modelSetting.getInitParamID(j), _this.modelSetting.getInitParamValue(j));
                            }
                            for (var j = 0; j < _this.modelSetting.getInitPartsVisibleNum(); j++) {
                                _this.live2DModel.setPartsOpacity(_this.modelSetting.getInitPartsVisibleID(j), _this.modelSetting.getInitPartsVisibleValue(j));
                            }
                            _this.live2DModel.saveParam();
                            _this.preloadMotionGroup(LAppDefine.MOTION_GROUP_IDLE);
                            _this.mainMotionManager.stopAllMotions();
                            _this.setUpdating(false);
                            _this.setInitialized(true);
                            if (typeof callback == 'function')
                                callback();
                        }
                    });
                }
            });
        });
    };
    LAppModel.prototype.release = function (gl) {
        var pm = Live2DFramework.getPlatformManager();
        gl.deleteTexture(pm.texture);
    };
    LAppModel.prototype.preloadMotionGroup = function (name) {
        var _this = this;
        var _loop_1 = function (i) {
            var file = this_1.modelSetting.getMotionFile(name, i);
            this_1.loadMotion(file, this_1.modelHomeDir + file, function (motion) {
                motion.setFadeIn(_this.modelSetting.getMotionFadeIn(name, i));
                motion.setFadeOut(_this.modelSetting.getMotionFadeOut(name, i));
            });
        };
        var this_1 = this;
        for (var i = 0; i < this.modelSetting.getMotionNum(name); i++) {
            _loop_1(i);
        }
    };
    LAppModel.prototype.update = function () {
        if (this.live2DModel == null) {
            if (LAppDefine.DEBUG_LOG)
                console.error('Failed to update.');
            return;
        }
        var timeMSec = UtSystem.getUserTimeMSec() - this.startTimeMSec;
        var timeSec = timeMSec / 1000.0;
        var t = timeSec * 2 * Math.PI;
        if (this.mainMotionManager.isFinished()) {
            this.startRandomMotion(LAppDefine.MOTION_GROUP_IDLE, LAppDefine.PRIORITY_IDLE);
        }
        this.live2DModel.loadParam();
        var update = this.mainMotionManager.updateParam(this.live2DModel);
        if (!update) {
            if (this.eyeBlink != null) {
                this.eyeBlink.updateParam(this.live2DModel);
            }
        }
        this.live2DModel.saveParam();
        if (this.expressionManager != null &&
            this.expressions != null &&
            !this.expressionManager.isFinished()) {
            this.expressionManager.updateParam(this.live2DModel);
        }
        this.live2DModel.addToParamFloat('PARAM_ANGLE_X', this.dragX * 30, 1);
        this.live2DModel.addToParamFloat('PARAM_ANGLE_Y', this.dragY * 30, 1);
        this.live2DModel.addToParamFloat('PARAM_ANGLE_Z', this.dragX * this.dragY * -30, 1);
        this.live2DModel.addToParamFloat('PARAM_BODY_ANGLE_X', this.dragX * 10, 1);
        this.live2DModel.addToParamFloat('PARAM_EYE_BALL_X', this.dragX, 1);
        this.live2DModel.addToParamFloat('PARAM_EYE_BALL_Y', this.dragY, 1);
        this.live2DModel.addToParamFloat('PARAM_ANGLE_X', Number(15 * Math.sin(t / 6.5345)), 0.5);
        this.live2DModel.addToParamFloat('PARAM_ANGLE_Y', Number(8 * Math.sin(t / 3.5345)), 0.5);
        this.live2DModel.addToParamFloat('PARAM_ANGLE_Z', Number(10 * Math.sin(t / 5.5345)), 0.5);
        this.live2DModel.addToParamFloat('PARAM_BODY_ANGLE_X', Number(4 * Math.sin(t / 15.5345)), 0.5);
        this.live2DModel.setParamFloat('PARAM_BREATH', Number(0.5 + 0.5 * Math.sin(t / 3.2345)), 1);
        if (this.physics != null) {
            this.physics.updateParam(this.live2DModel);
        }
        if (this.lipSync == null) {
            this.live2DModel.setParamFloat('PARAM_MOUTH_OPEN_Y', this.lipSyncValue);
        }
        if (this.pose != null) {
            this.pose.updateParam(this.live2DModel);
        }
        this.live2DModel.update();
    };
    LAppModel.prototype.setRandomExpression = function () {
        var tmp = [];
        for (var name_1 in this.expressions) {
            tmp.push(name_1);
        }
        var no = parseInt(Math.random() * tmp.length);
        this.setExpression(tmp[no]);
    };
    LAppModel.prototype.startRandomMotion = function (name, priority) {
        var max = this.modelSetting.getMotionNum(name);
        var no = parseInt(Math.random() * max);
        this.startMotion(name, no, priority);
    };
    LAppModel.prototype.startMotion = function (name, no, priority) {
        var _this = this;
        var motionName = this.modelSetting.getMotionFile(name, no);
        if (motionName == null || motionName == '') {
            if (LAppDefine.DEBUG_LOG)
                console.error('Failed to motion.');
            return;
        }
        if (priority == LAppDefine.PRIORITY_FORCE) {
            this.mainMotionManager.setReservePriority(priority);
        }
        else if (!this.mainMotionManager.reserveMotion(priority)) {
            if (LAppDefine.DEBUG_LOG)
                console.log('Motion is running.');
            return;
        }
        var motion;
        if (this.motions[name] == null) {
            this.loadMotion(null, this.modelHomeDir + motionName, function (mtn) {
                motion = mtn;
                _this.setFadeInFadeOut(name, no, priority, motion);
            });
        }
        else {
            motion = this.motions[name];
            this.setFadeInFadeOut(name, no, priority, motion);
        }
    };
    LAppModel.prototype.setFadeInFadeOut = function (name, no, priority, motion) {
        var motionName = this.modelSetting.getMotionFile(name, no);
        motion.setFadeIn(this.modelSetting.getMotionFadeIn(name, no));
        motion.setFadeOut(this.modelSetting.getMotionFadeOut(name, no));
        if (LAppDefine.DEBUG_LOG)
            console.log('Start motion : ' + motionName);
        if (this.modelSetting.getMotionSound(name, no) == null) {
            this.mainMotionManager.startMotionPrio(motion, priority);
        }
        else {
            var soundName = this.modelSetting.getMotionSound(name, no);
            var snd = document.createElement('audio');
            snd.src = this.modelHomeDir + soundName;
            if (LAppDefine.DEBUG_LOG)
                console.log('Start sound : ' + soundName);
            snd.play();
            this.mainMotionManager.startMotionPrio(motion, priority);
        }
    };
    LAppModel.prototype.setExpression = function (name) {
        var motion = this.expressions[name];
        if (LAppDefine.DEBUG_LOG)
            console.log('Expression : ' + name);
        this.expressionManager.startMotion(motion, false);
    };
    LAppModel.prototype.draw = function (gl) {
        MatrixStack.push();
        MatrixStack.multMatrix(this.modelMatrix.getArray());
        this.tmpMatrix = MatrixStack.getMatrix();
        this.live2DModel.setMatrix(this.tmpMatrix);
        this.live2DModel.draw();
        MatrixStack.pop();
    };
    LAppModel.prototype.hitTest = function (id, testX, testY) {
        var len = this.modelSetting.getHitAreaNum();
        for (var i = 0; i < len; i++) {
            if (id == this.modelSetting.getHitAreaName(i)) {
                var drawID = this.modelSetting.getHitAreaID(i);
                return this.hitTestSimple(drawID, testX, testY);
            }
        }
        return false;
    };
    return LAppModel;
}(L2DBaseModel));
export default LAppModel;
