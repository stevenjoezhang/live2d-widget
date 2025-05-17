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
import logger from '../logger';
var L2DBaseModel = (function () {
    function L2DBaseModel() {
        this.live2DModel = null;
        this.modelMatrix = null;
        this.eyeBlink = null;
        this.physics = null;
        this.pose = null;
        this.initialized = false;
        this.updating = false;
        this.alpha = 1;
        this.accAlpha = 0;
        this.lipSync = false;
        this.lipSyncValue = 0;
        this.accelX = 0;
        this.accelY = 0;
        this.accelZ = 0;
        this.dragX = 0;
        this.dragY = 0;
        this.startTimeMSec = null;
        this.mainMotionManager = new L2DMotionManager();
        this.expressionManager = new L2DMotionManager();
        this.motions = {};
        this.expressions = {};
        this.isTexLoaded = false;
    }
    L2DBaseModel.prototype.getModelMatrix = function () {
        return this.modelMatrix;
    };
    L2DBaseModel.prototype.setAlpha = function (a) {
        if (a > 0.999)
            a = 1;
        if (a < 0.001)
            a = 0;
        this.alpha = a;
    };
    L2DBaseModel.prototype.getAlpha = function () {
        return this.alpha;
    };
    L2DBaseModel.prototype.isInitialized = function () {
        return this.initialized;
    };
    L2DBaseModel.prototype.setInitialized = function (v) {
        this.initialized = v;
    };
    L2DBaseModel.prototype.isUpdating = function () {
        return this.updating;
    };
    L2DBaseModel.prototype.setUpdating = function (v) {
        this.updating = v;
    };
    L2DBaseModel.prototype.getLive2DModel = function () {
        return this.live2DModel;
    };
    L2DBaseModel.prototype.setLipSync = function (v) {
        this.lipSync = v;
    };
    L2DBaseModel.prototype.setLipSyncValue = function (v) {
        this.lipSyncValue = v;
    };
    L2DBaseModel.prototype.setAccel = function (x, y, z) {
        this.accelX = x;
        this.accelY = y;
        this.accelZ = z;
    };
    L2DBaseModel.prototype.setDrag = function (x, y) {
        this.dragX = x;
        this.dragY = y;
    };
    L2DBaseModel.prototype.getMainMotionManager = function () {
        return this.mainMotionManager;
    };
    L2DBaseModel.prototype.getExpressionManager = function () {
        return this.expressionManager;
    };
    L2DBaseModel.prototype.loadModelData = function (path, callback) {
        var _this = this;
        var pm = Live2DFramework.getPlatformManager();
        logger.info('Load model : ' + path);
        pm.loadLive2DModel(path, function (l2dModel) {
            _this.live2DModel = l2dModel;
            _this.live2DModel.saveParam();
            var _err = Live2D.getError();
            if (_err != 0) {
                logger.error('Error : Failed to loadModelData().');
                return;
            }
            _this.modelMatrix = new L2DModelMatrix(_this.live2DModel.getCanvasWidth(), _this.live2DModel.getCanvasHeight());
            _this.modelMatrix.setWidth(2);
            _this.modelMatrix.setCenterPosition(0, 0);
            callback(_this.live2DModel);
        });
    };
    L2DBaseModel.prototype.loadTexture = function (no, path, callback) {
        var _this = this;
        texCounter++;
        var pm = Live2DFramework.getPlatformManager();
        logger.info('Load Texture : ' + path);
        pm.loadTexture(this.live2DModel, no, path, function () {
            texCounter--;
            if (texCounter == 0)
                _this.isTexLoaded = true;
            if (typeof callback == 'function')
                callback();
        });
    };
    L2DBaseModel.prototype.loadMotion = function (name, path, callback) {
        var _this = this;
        var pm = Live2DFramework.getPlatformManager();
        logger.trace('Load Motion : ' + path);
        var motion = null;
        pm.loadBytes(path, function (buf) {
            motion = Live2DMotion.loadMotion(buf);
            if (name != null) {
                _this.motions[name] = motion;
            }
            callback(motion);
        });
    };
    L2DBaseModel.prototype.loadExpression = function (name, path, callback) {
        var _this = this;
        var pm = Live2DFramework.getPlatformManager();
        logger.trace('Load Expression : ' + path);
        pm.loadBytes(path, function (buf) {
            if (name != null) {
                _this.expressions[name] = L2DExpressionMotion.loadJson(buf);
            }
            if (typeof callback == 'function')
                callback();
        });
    };
    L2DBaseModel.prototype.loadPose = function (path, callback) {
        var _this = this;
        var pm = Live2DFramework.getPlatformManager();
        logger.trace('Load Pose : ' + path);
        try {
            pm.loadBytes(path, function (buf) {
                _this.pose = L2DPose.load(buf);
                if (typeof callback == 'function')
                    callback();
            });
        }
        catch (e) {
            logger.warn(e);
        }
    };
    L2DBaseModel.prototype.loadPhysics = function (path) {
        var _this = this;
        var pm = Live2DFramework.getPlatformManager();
        logger.trace('Load Physics : ' + path);
        try {
            pm.loadBytes(path, function (buf) {
                _this.physics = L2DPhysics.load(buf);
            });
        }
        catch (e) {
            logger.warn(e);
        }
    };
    L2DBaseModel.prototype.hitTestSimple = function (drawID, testX, testY) {
        var drawIndex = this.live2DModel.getDrawDataIndex(drawID);
        if (drawIndex < 0)
            return false;
        var points = this.live2DModel.getTransformedPoints(drawIndex);
        var left = this.live2DModel.getCanvasWidth();
        var right = 0;
        var top = this.live2DModel.getCanvasHeight();
        var bottom = 0;
        for (var j = 0; j < points.length; j = j + 2) {
            var x = points[j];
            var y = points[j + 1];
            if (x < left)
                left = x;
            if (x > right)
                right = x;
            if (y < top)
                top = y;
            if (y > bottom)
                bottom = y;
        }
        var tx = this.modelMatrix.invertTransformX(testX);
        var ty = this.modelMatrix.invertTransformY(testY);
        return left <= tx && tx <= right && top <= ty && ty <= bottom;
    };
    return L2DBaseModel;
}());
var texCounter = 0;
var L2DExpressionMotion = (function (_super) {
    __extends(L2DExpressionMotion, _super);
    function L2DExpressionMotion() {
        var _this = _super.call(this) || this;
        _this.paramList = [];
        return _this;
    }
    L2DExpressionMotion.loadJson = function (buf) {
        var ret = new L2DExpressionMotion();
        var pm = Live2DFramework.getPlatformManager();
        var json = pm.jsonParseFromBytes(buf);
        ret.setFadeIn(parseInt(json.fade_in) > 0 ? parseInt(json.fade_in) : 1000);
        ret.setFadeOut(parseInt(json.fade_out) > 0 ? parseInt(json.fade_out) : 1000);
        if (json.params == null) {
            return ret;
        }
        var params = json.params;
        var paramNum = params.length;
        ret.paramList = [];
        for (var i = 0; i < paramNum; i++) {
            var param = params[i];
            var paramID = param.id.toString();
            var value = parseFloat(param.val);
            var calcTypeInt = L2DExpressionMotion.TYPE_ADD;
            var calc = param.calc != null ? param.calc.toString() : 'add';
            if (calc === 'add') {
                calcTypeInt = L2DExpressionMotion.TYPE_ADD;
            }
            else if (calc === 'mult') {
                calcTypeInt = L2DExpressionMotion.TYPE_MULT;
            }
            else if (calc === 'set') {
                calcTypeInt = L2DExpressionMotion.TYPE_SET;
            }
            else {
                calcTypeInt = L2DExpressionMotion.TYPE_ADD;
            }
            if (calcTypeInt == L2DExpressionMotion.TYPE_ADD) {
                var defaultValue = param.def == null ? 0 : parseFloat(param.def);
                value = value - defaultValue;
            }
            else if (calcTypeInt == L2DExpressionMotion.TYPE_MULT) {
                var defaultValue = param.def == null ? 1 : parseFloat(param.def);
                if (defaultValue == 0)
                    defaultValue = 1;
                value = value / defaultValue;
            }
            var item = new L2DExpressionParam();
            item.id = paramID;
            item.type = calcTypeInt;
            item.value = value;
            ret.paramList.push(item);
        }
        return ret;
    };
    L2DExpressionMotion.prototype.updateParamExe = function (model, timeMSec, weight, motionQueueEnt) {
        for (var i = this.paramList.length - 1; i >= 0; --i) {
            var param = this.paramList[i];
            if (param.type == L2DExpressionMotion.TYPE_ADD) {
                model.addToParamFloat(param.id, param.value, weight);
            }
            else if (param.type == L2DExpressionMotion.TYPE_MULT) {
                model.multParamFloat(param.id, param.value, weight);
            }
            else if (param.type == L2DExpressionMotion.TYPE_SET) {
                model.setParamFloat(param.id, param.value, weight);
            }
        }
    };
    return L2DExpressionMotion;
}(AMotion));
L2DExpressionMotion.EXPRESSION_DEFAULT = 'DEFAULT';
L2DExpressionMotion.TYPE_SET = 0;
L2DExpressionMotion.TYPE_ADD = 1;
L2DExpressionMotion.TYPE_MULT = 2;
function L2DExpressionParam() {
    this.id = '';
    this.type = -1;
    this.value = null;
}
var L2DEyeBlink = (function () {
    function L2DEyeBlink() {
        this.nextBlinkTime = null;
        this.stateStartTime = null;
        this.blinkIntervalMsec = null;
        this.eyeState = EYE_STATE.STATE_FIRST;
        this.blinkIntervalMsec = 4000;
        this.closingMotionMsec = 100;
        this.closedMotionMsec = 50;
        this.openingMotionMsec = 150;
        this.closeIfZero = true;
        this.eyeID_L = 'PARAM_EYE_L_OPEN';
        this.eyeID_R = 'PARAM_EYE_R_OPEN';
    }
    L2DEyeBlink.prototype.calcNextBlink = function () {
        var time = UtSystem.getUserTimeMSec();
        var r = Math.random();
        return time + r * (2 * this.blinkIntervalMsec - 1);
    };
    L2DEyeBlink.prototype.setInterval = function (blinkIntervalMsec) {
        this.blinkIntervalMsec = blinkIntervalMsec;
    };
    L2DEyeBlink.prototype.setEyeMotion = function (closingMotionMsec, closedMotionMsec, openingMotionMsec) {
        this.closingMotionMsec = closingMotionMsec;
        this.closedMotionMsec = closedMotionMsec;
        this.openingMotionMsec = openingMotionMsec;
    };
    L2DEyeBlink.prototype.updateParam = function (model) {
        var time = UtSystem.getUserTimeMSec();
        var eyeParamValue;
        var t = 0;
        switch (this.eyeState) {
            case EYE_STATE.STATE_CLOSING:
                t = (time - this.stateStartTime) / this.closingMotionMsec;
                if (t >= 1) {
                    t = 1;
                    this.eyeState = EYE_STATE.STATE_CLOSED;
                    this.stateStartTime = time;
                }
                eyeParamValue = 1 - t;
                break;
            case EYE_STATE.STATE_CLOSED:
                t = (time - this.stateStartTime) / this.closedMotionMsec;
                if (t >= 1) {
                    this.eyeState = EYE_STATE.STATE_OPENING;
                    this.stateStartTime = time;
                }
                eyeParamValue = 0;
                break;
            case EYE_STATE.STATE_OPENING:
                t = (time - this.stateStartTime) / this.openingMotionMsec;
                if (t >= 1) {
                    t = 1;
                    this.eyeState = EYE_STATE.STATE_INTERVAL;
                    this.nextBlinkTime = this.calcNextBlink();
                }
                eyeParamValue = t;
                break;
            case EYE_STATE.STATE_INTERVAL:
                if (this.nextBlinkTime < time) {
                    this.eyeState = EYE_STATE.STATE_CLOSING;
                    this.stateStartTime = time;
                }
                eyeParamValue = 1;
                break;
            case EYE_STATE.STATE_FIRST:
            default:
                this.eyeState = EYE_STATE.STATE_INTERVAL;
                this.nextBlinkTime = this.calcNextBlink();
                eyeParamValue = 1;
                break;
        }
        if (!this.closeIfZero)
            eyeParamValue = -eyeParamValue;
        model.setParamFloat(this.eyeID_L, eyeParamValue);
        model.setParamFloat(this.eyeID_R, eyeParamValue);
    };
    return L2DEyeBlink;
}());
var EYE_STATE = function () { };
EYE_STATE.STATE_FIRST = 'STATE_FIRST';
EYE_STATE.STATE_INTERVAL = 'STATE_INTERVAL';
EYE_STATE.STATE_CLOSING = 'STATE_CLOSING';
EYE_STATE.STATE_CLOSED = 'STATE_CLOSED';
EYE_STATE.STATE_OPENING = 'STATE_OPENING';
var L2DMatrix44 = (function () {
    function L2DMatrix44() {
        this.tr = new Float32Array(16);
        this.identity();
    }
    L2DMatrix44.mul = function (a, b, dst) {
        var c = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        var n = 4;
        var i, j, k;
        for (i = 0; i < n; i++) {
            for (j = 0; j < n; j++) {
                for (k = 0; k < n; k++) {
                    c[i + j * 4] += a[i + k * 4] * b[k + j * 4];
                }
            }
        }
        for (i = 0; i < 16; i++) {
            dst[i] = c[i];
        }
    };
    L2DMatrix44.prototype.identity = function () {
        for (var i = 0; i < 16; i++)
            this.tr[i] = i % 5 == 0 ? 1 : 0;
    };
    L2DMatrix44.prototype.getArray = function () {
        return this.tr;
    };
    L2DMatrix44.prototype.getCopyMatrix = function () {
        return new Float32Array(this.tr);
    };
    L2DMatrix44.prototype.setMatrix = function (tr) {
        if (this.tr == null || this.tr.length != this.tr.length)
            return;
        for (var i = 0; i < 16; i++)
            this.tr[i] = tr[i];
    };
    L2DMatrix44.prototype.getScaleX = function () {
        return this.tr[0];
    };
    L2DMatrix44.prototype.getScaleY = function () {
        return this.tr[5];
    };
    L2DMatrix44.prototype.transformX = function (src) {
        return this.tr[0] * src + this.tr[12];
    };
    L2DMatrix44.prototype.transformY = function (src) {
        return this.tr[5] * src + this.tr[13];
    };
    L2DMatrix44.prototype.invertTransformX = function (src) {
        return (src - this.tr[12]) / this.tr[0];
    };
    L2DMatrix44.prototype.invertTransformY = function (src) {
        return (src - this.tr[13]) / this.tr[5];
    };
    L2DMatrix44.prototype.multTranslate = function (shiftX, shiftY) {
        var tr1 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, shiftX, shiftY, 0, 1];
        L2DMatrix44.mul(tr1, this.tr, this.tr);
    };
    L2DMatrix44.prototype.translate = function (x, y) {
        this.tr[12] = x;
        this.tr[13] = y;
    };
    L2DMatrix44.prototype.translateX = function (x) {
        this.tr[12] = x;
    };
    L2DMatrix44.prototype.translateY = function (y) {
        this.tr[13] = y;
    };
    L2DMatrix44.prototype.multScale = function (scaleX, scaleY) {
        var tr1 = [scaleX, 0, 0, 0, 0, scaleY, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        L2DMatrix44.mul(tr1, this.tr, this.tr);
    };
    L2DMatrix44.prototype.scale = function (scaleX, scaleY) {
        this.tr[0] = scaleX;
        this.tr[5] = scaleY;
    };
    return L2DMatrix44;
}());
var L2DModelMatrix = (function (_super) {
    __extends(L2DModelMatrix, _super);
    function L2DModelMatrix(w, h) {
        var _this = _super.call(this) || this;
        _this.width = w;
        _this.height = h;
        return _this;
    }
    L2DModelMatrix.prototype.setPosition = function (x, y) {
        this.translate(x, y);
    };
    L2DModelMatrix.prototype.setCenterPosition = function (x, y) {
        var w = this.width * this.getScaleX();
        var h = this.height * this.getScaleY();
        this.translate(x - w / 2, y - h / 2);
    };
    L2DModelMatrix.prototype.top = function (y) {
        this.setY(y);
    };
    L2DModelMatrix.prototype.bottom = function (y) {
        var h = this.height * this.getScaleY();
        this.translateY(y - h);
    };
    L2DModelMatrix.prototype.left = function (x) {
        this.setX(x);
    };
    L2DModelMatrix.prototype.right = function (x) {
        var w = this.width * this.getScaleX();
        this.translateX(x - w);
    };
    L2DModelMatrix.prototype.centerX = function (x) {
        var w = this.width * this.getScaleX();
        this.translateX(x - w / 2);
    };
    L2DModelMatrix.prototype.centerY = function (y) {
        var h = this.height * this.getScaleY();
        this.translateY(y - h / 2);
    };
    L2DModelMatrix.prototype.setX = function (x) {
        this.translateX(x);
    };
    L2DModelMatrix.prototype.setY = function (y) {
        this.translateY(y);
    };
    L2DModelMatrix.prototype.setHeight = function (h) {
        var scaleX = h / this.height;
        var scaleY = -scaleX;
        this.scale(scaleX, scaleY);
    };
    L2DModelMatrix.prototype.setWidth = function (w) {
        var scaleX = w / this.width;
        var scaleY = -scaleX;
        this.scale(scaleX, scaleY);
    };
    return L2DModelMatrix;
}(L2DMatrix44));
var L2DMotionManager = (function (_super) {
    __extends(L2DMotionManager, _super);
    function L2DMotionManager() {
        var _this = _super.call(this) || this;
        _this.currentPriority = null;
        _this.reservePriority = null;
        _this.super = MotionQueueManager.prototype;
        return _this;
    }
    L2DMotionManager.prototype.getCurrentPriority = function () {
        return this.currentPriority;
    };
    L2DMotionManager.prototype.getReservePriority = function () {
        return this.reservePriority;
    };
    L2DMotionManager.prototype.reserveMotion = function (priority) {
        if (this.reservePriority >= priority) {
            return false;
        }
        if (this.currentPriority >= priority) {
            return false;
        }
        this.reservePriority = priority;
        return true;
    };
    L2DMotionManager.prototype.setReservePriority = function (val) {
        this.reservePriority = val;
    };
    L2DMotionManager.prototype.updateParam = function (model) {
        var updated = MotionQueueManager.prototype.updateParam.call(this, model);
        if (this.isFinished()) {
            this.currentPriority = 0;
        }
        return updated;
    };
    L2DMotionManager.prototype.startMotionPrio = function (motion, priority) {
        if (priority == this.reservePriority) {
            this.reservePriority = 0;
        }
        this.currentPriority = priority;
        return this.startMotion(motion, false);
    };
    return L2DMotionManager;
}(MotionQueueManager));
var L2DPhysics = (function () {
    function L2DPhysics() {
        this.physicsList = [];
        this.startTimeMSec = UtSystem.getUserTimeMSec();
    }
    L2DPhysics.load = function (buf) {
        var ret = new L2DPhysics();
        var pm = Live2DFramework.getPlatformManager();
        var json = pm.jsonParseFromBytes(buf);
        var params = json.physics_hair;
        var paramNum = params.length;
        for (var i = 0; i < paramNum; i++) {
            var param = params[i];
            var physics = new PhysicsHair();
            var setup = param.setup;
            var length_1 = parseFloat(setup.length);
            var resist = parseFloat(setup.regist);
            var mass = parseFloat(setup.mass);
            physics.setup(length_1, resist, mass);
            var srcList = param.src;
            var srcNum = srcList.length;
            for (var j = 0; j < srcNum; j++) {
                var src = srcList[j];
                var id = src.id;
                var type = PhysicsHair.Src.SRC_TO_X;
                var typeStr = src.ptype;
                if (typeStr === 'x') {
                    type = PhysicsHair.Src.SRC_TO_X;
                }
                else if (typeStr === 'y') {
                    type = PhysicsHair.Src.SRC_TO_Y;
                }
                else if (typeStr === 'angle') {
                    type = PhysicsHair.Src.SRC_TO_G_ANGLE;
                }
                else {
                    UtDebug.error('live2d', 'Invalid parameter:PhysicsHair.Src');
                }
                var scale = parseFloat(src.scale);
                var weight = parseFloat(src.weight);
                physics.addSrcParam(type, id, scale, weight);
            }
            var targetList = param.targets;
            var targetNum = targetList.length;
            for (var j = 0; j < targetNum; j++) {
                var target = targetList[j];
                var id = target.id;
                var type = PhysicsHair.Target.TARGET_FROM_ANGLE;
                var typeStr = target.ptype;
                if (typeStr === 'angle') {
                    type = PhysicsHair.Target.TARGET_FROM_ANGLE;
                }
                else if (typeStr === 'angle_v') {
                    type = PhysicsHair.Target.TARGET_FROM_ANGLE_V;
                }
                else {
                    UtDebug.error('live2d', 'Invalid parameter:PhysicsHair.Target');
                }
                var scale = parseFloat(target.scale);
                var weight = parseFloat(target.weight);
                physics.addTargetParam(type, id, scale, weight);
            }
            ret.physicsList.push(physics);
        }
        return ret;
    };
    L2DPhysics.prototype.updateParam = function (model) {
        var timeMSec = UtSystem.getUserTimeMSec() - this.startTimeMSec;
        for (var i = 0; i < this.physicsList.length; i++) {
            this.physicsList[i].update(model, timeMSec);
        }
    };
    return L2DPhysics;
}());
var L2DPose = (function () {
    function L2DPose() {
        this.lastTime = 0;
        this.lastModel = null;
        this.partsGroups = [];
    }
    L2DPose.load = function (buf) {
        var ret = new L2DPose();
        var pm = Live2DFramework.getPlatformManager();
        var json = pm.jsonParseFromBytes(buf);
        var poseListInfo = json.parts_visible;
        var poseNum = poseListInfo.length;
        for (var i_pose = 0; i_pose < poseNum; i_pose++) {
            var poseInfo = poseListInfo[i_pose];
            var idListInfo = poseInfo.group;
            var idNum = idListInfo.length;
            var partsGroup = [];
            for (var i_group = 0; i_group < idNum; i_group++) {
                var partsInfo = idListInfo[i_group];
                var parts = new L2DPartsParam(partsInfo.id);
                partsGroup[i_group] = parts;
                if (partsInfo.link == null)
                    continue;
                var linkListInfo = partsInfo.link;
                var linkNum = linkListInfo.length;
                parts.link = [];
                for (var i_link = 0; i_link < linkNum; i_link++) {
                    var linkParts = new L2DPartsParam(linkListInfo[i_link]);
                    parts.link.push(linkParts);
                }
            }
            ret.partsGroups.push(partsGroup);
        }
        return ret;
    };
    L2DPose.prototype.updateParam = function (model) {
        if (model == null)
            return;
        if (!(model == this.lastModel)) {
            this.initParam(model);
        }
        this.lastModel = model;
        var curTime = UtSystem.getUserTimeMSec();
        var deltaTimeSec = this.lastTime == 0 ? 0 : (curTime - this.lastTime) / 1000.0;
        this.lastTime = curTime;
        if (deltaTimeSec < 0)
            deltaTimeSec = 0;
        for (var i = 0; i < this.partsGroups.length; i++) {
            this.normalizePartsOpacityGroup(model, this.partsGroups[i], deltaTimeSec);
            this.copyOpacityOtherParts(model, this.partsGroups[i]);
        }
    };
    L2DPose.prototype.initParam = function (model) {
        if (model == null)
            return;
        for (var i = 0; i < this.partsGroups.length; i++) {
            var partsGroup = this.partsGroups[i];
            for (var j = 0; j < partsGroup.length; j++) {
                partsGroup[j].initIndex(model);
                var partsIndex = partsGroup[j].partsIndex;
                var paramIndex = partsGroup[j].paramIndex;
                if (partsIndex < 0)
                    continue;
                var v = model.getParamFloat(paramIndex) != 0;
                model.setPartsOpacity(partsIndex, v ? 1.0 : 0.0);
                model.setParamFloat(paramIndex, v ? 1.0 : 0.0);
                if (partsGroup[j].link == null)
                    continue;
                for (var k = 0; k < partsGroup[j].link.length; k++) {
                    partsGroup[j].link[k].initIndex(model);
                }
            }
        }
    };
    L2DPose.prototype.normalizePartsOpacityGroup = function (model, partsGroup, deltaTimeSec) {
        var visibleParts = -1;
        var visibleOpacity = 1.0;
        var CLEAR_TIME_SEC = 0.5;
        var phi = 0.5;
        var maxBackOpacity = 0.15;
        for (var i = 0; i < partsGroup.length; i++) {
            var partsIndex = partsGroup[i].partsIndex;
            var paramIndex = partsGroup[i].paramIndex;
            if (partsIndex < 0)
                continue;
            if (model.getParamFloat(paramIndex) != 0) {
                if (visibleParts >= 0) {
                    break;
                }
                visibleParts = i;
                visibleOpacity = model.getPartsOpacity(partsIndex);
                visibleOpacity += deltaTimeSec / CLEAR_TIME_SEC;
                if (visibleOpacity > 1) {
                    visibleOpacity = 1;
                }
            }
        }
        if (visibleParts < 0) {
            visibleParts = 0;
            visibleOpacity = 1;
        }
        for (var i = 0; i < partsGroup.length; i++) {
            var partsIndex = partsGroup[i].partsIndex;
            if (partsIndex < 0)
                continue;
            if (visibleParts == i) {
                model.setPartsOpacity(partsIndex, visibleOpacity);
            }
            else {
                var opacity = model.getPartsOpacity(partsIndex);
                var a1 = void 0;
                if (visibleOpacity < phi) {
                    a1 = (visibleOpacity * (phi - 1)) / phi + 1;
                }
                else {
                    a1 = ((1 - visibleOpacity) * phi) / (1 - phi);
                }
                var backOp = (1 - a1) * (1 - visibleOpacity);
                if (backOp > maxBackOpacity) {
                    a1 = 1 - maxBackOpacity / (1 - visibleOpacity);
                }
                if (opacity > a1) {
                    opacity = a1;
                }
                model.setPartsOpacity(partsIndex, opacity);
            }
        }
    };
    L2DPose.prototype.copyOpacityOtherParts = function (model, partsGroup) {
        for (var i_group = 0; i_group < partsGroup.length; i_group++) {
            var partsParam = partsGroup[i_group];
            if (partsParam.link == null)
                continue;
            if (partsParam.partsIndex < 0)
                continue;
            var opacity = model.getPartsOpacity(partsParam.partsIndex);
            for (var i_link = 0; i_link < partsParam.link.length; i_link++) {
                var linkParts = partsParam.link[i_link];
                if (linkParts.partsIndex < 0)
                    continue;
                model.setPartsOpacity(linkParts.partsIndex, opacity);
            }
        }
    };
    return L2DPose;
}());
var L2DPartsParam = (function () {
    function L2DPartsParam(id) {
        this.paramIndex = -1;
        this.partsIndex = -1;
        this.link = null;
        this.id = id;
    }
    L2DPartsParam.prototype.initIndex = function (model) {
        this.paramIndex = model.getParamIndex('VISIBLE:' + this.id);
        this.partsIndex = model.getPartsDataIndex(PartsDataID.getID(this.id));
        model.setParamFloat(this.paramIndex, 1);
    };
    return L2DPartsParam;
}());
var L2DTargetPoint = (function () {
    function L2DTargetPoint() {
        this.EPSILON = 0.01;
        this.faceTargetX = 0;
        this.faceTargetY = 0;
        this.faceX = 0;
        this.faceY = 0;
        this.faceVX = 0;
        this.faceVY = 0;
        this.lastTimeSec = 0;
    }
    L2DTargetPoint.prototype.setPoint = function (x, y) {
        this.faceTargetX = x;
        this.faceTargetY = y;
    };
    L2DTargetPoint.prototype.getX = function () {
        return this.faceX;
    };
    L2DTargetPoint.prototype.getY = function () {
        return this.faceY;
    };
    L2DTargetPoint.prototype.update = function () {
        var TIME_TO_MAX_SPEED = 0.15;
        var FACE_PARAM_MAX_V = 40.0 / 7.5;
        var MAX_V = FACE_PARAM_MAX_V / L2DTargetPoint.FRAME_RATE;
        if (this.lastTimeSec == 0) {
            this.lastTimeSec = UtSystem.getUserTimeMSec();
            return;
        }
        var curTimeSec = UtSystem.getUserTimeMSec();
        var deltaTimeWeight = ((curTimeSec - this.lastTimeSec) * L2DTargetPoint.FRAME_RATE) / 1000.0;
        this.lastTimeSec = curTimeSec;
        var FRAME_TO_MAX_SPEED = TIME_TO_MAX_SPEED * L2DTargetPoint.FRAME_RATE;
        var MAX_A = (deltaTimeWeight * MAX_V) / FRAME_TO_MAX_SPEED;
        var dx = this.faceTargetX - this.faceX;
        var dy = this.faceTargetY - this.faceY;
        if (Math.abs(dx) <= this.EPSILON && Math.abs(dy) <= this.EPSILON)
            return;
        var d = Math.sqrt(dx * dx + dy * dy);
        var vx = (MAX_V * dx) / d;
        var vy = (MAX_V * dy) / d;
        var ax = vx - this.faceVX;
        var ay = vy - this.faceVY;
        var a = Math.sqrt(ax * ax + ay * ay);
        if (a < -MAX_A || a > MAX_A) {
            ax *= MAX_A / a;
            ay *= MAX_A / a;
            a = MAX_A;
        }
        this.faceVX += ax;
        this.faceVY += ay;
        {
            var max_v = 0.5 *
                (Math.sqrt(MAX_A * MAX_A + 16 * MAX_A * d - 8 * MAX_A * d) - MAX_A);
            var cur_v = Math.sqrt(this.faceVX * this.faceVX + this.faceVY * this.faceVY);
            if (cur_v > max_v) {
                this.faceVX *= max_v / cur_v;
                this.faceVY *= max_v / cur_v;
            }
        }
        this.faceX += this.faceVX;
        this.faceY += this.faceVY;
    };
    return L2DTargetPoint;
}());
L2DTargetPoint.FRAME_RATE = 30;
var L2DViewMatrix = (function (_super) {
    __extends(L2DViewMatrix, _super);
    function L2DViewMatrix() {
        var _this = _super.call(this) || this;
        _this.screenLeft = null;
        _this.screenRight = null;
        _this.screenTop = null;
        _this.screenBottom = null;
        _this.maxLeft = null;
        _this.maxRight = null;
        _this.maxTop = null;
        _this.maxBottom = null;
        _this.max = Number.MAX_VALUE;
        _this.min = 0;
        return _this;
    }
    L2DViewMatrix.prototype.getMaxScale = function () {
        return this.max;
    };
    L2DViewMatrix.prototype.getMinScale = function () {
        return this.min;
    };
    L2DViewMatrix.prototype.setMaxScale = function (v) {
        this.max = v;
    };
    L2DViewMatrix.prototype.setMinScale = function (v) {
        this.min = v;
    };
    L2DViewMatrix.prototype.isMaxScale = function () {
        return this.getScaleX() == this.max;
    };
    L2DViewMatrix.prototype.isMinScale = function () {
        return this.getScaleX() == this.min;
    };
    L2DViewMatrix.prototype.adjustTranslate = function (shiftX, shiftY) {
        if (this.tr[0] * this.maxLeft + (this.tr[12] + shiftX) > this.screenLeft)
            shiftX = this.screenLeft - this.tr[0] * this.maxLeft - this.tr[12];
        if (this.tr[0] * this.maxRight + (this.tr[12] + shiftX) < this.screenRight)
            shiftX = this.screenRight - this.tr[0] * this.maxRight - this.tr[12];
        if (this.tr[5] * this.maxTop + (this.tr[13] + shiftY) < this.screenTop)
            shiftY = this.screenTop - this.tr[5] * this.maxTop - this.tr[13];
        if (this.tr[5] * this.maxBottom + (this.tr[13] + shiftY) >
            this.screenBottom)
            shiftY = this.screenBottom - this.tr[5] * this.maxBottom - this.tr[13];
        var tr1 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, shiftX, shiftY, 0, 1];
        L2DMatrix44.mul(tr1, this.tr, this.tr);
    };
    L2DViewMatrix.prototype.adjustScale = function (cx, cy, scale) {
        var targetScale = scale * this.tr[0];
        if (targetScale < this.min) {
            if (this.tr[0] > 0)
                scale = this.min / this.tr[0];
        }
        else if (targetScale > this.max) {
            if (this.tr[0] > 0)
                scale = this.max / this.tr[0];
        }
        var tr1 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, cx, cy, 0, 1];
        var tr2 = [scale, 0, 0, 0, 0, scale, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        var tr3 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -cx, -cy, 0, 1];
        L2DMatrix44.mul(tr3, this.tr, this.tr);
        L2DMatrix44.mul(tr2, this.tr, this.tr);
        L2DMatrix44.mul(tr1, this.tr, this.tr);
    };
    L2DViewMatrix.prototype.setScreenRect = function (left, right, bottom, top) {
        this.screenLeft = left;
        this.screenRight = right;
        this.screenTop = top;
        this.screenBottom = bottom;
    };
    L2DViewMatrix.prototype.setMaxScreenRect = function (left, right, bottom, top) {
        this.maxLeft = left;
        this.maxRight = right;
        this.maxTop = top;
        this.maxBottom = bottom;
    };
    L2DViewMatrix.prototype.getScreenLeft = function () {
        return this.screenLeft;
    };
    L2DViewMatrix.prototype.getScreenRight = function () {
        return this.screenRight;
    };
    L2DViewMatrix.prototype.getScreenBottom = function () {
        return this.screenBottom;
    };
    L2DViewMatrix.prototype.getScreenTop = function () {
        return this.screenTop;
    };
    L2DViewMatrix.prototype.getMaxLeft = function () {
        return this.maxLeft;
    };
    L2DViewMatrix.prototype.getMaxRight = function () {
        return this.maxRight;
    };
    L2DViewMatrix.prototype.getMaxBottom = function () {
        return this.maxBottom;
    };
    L2DViewMatrix.prototype.getMaxTop = function () {
        return this.maxTop;
    };
    return L2DViewMatrix;
}(L2DMatrix44));
var Live2DFramework = (function () {
    function Live2DFramework() {
    }
    Live2DFramework.getPlatformManager = function () {
        return Live2DFramework.platformManager;
    };
    Live2DFramework.setPlatformManager = function (platformManager) {
        Live2DFramework.platformManager = platformManager;
    };
    return Live2DFramework;
}());
Live2DFramework.platformManager = null;
export { L2DBaseModel, L2DViewMatrix, L2DEyeBlink, Live2DFramework, L2DMatrix44, L2DTargetPoint };
