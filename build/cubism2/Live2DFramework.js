import logger from '../logger.js';
class L2DBaseModel {
    constructor() {
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
    getModelMatrix() {
        return this.modelMatrix;
    }
    setAlpha(a) {
        if (a > 0.999)
            a = 1;
        if (a < 0.001)
            a = 0;
        this.alpha = a;
    }
    getAlpha() {
        return this.alpha;
    }
    isInitialized() {
        return this.initialized;
    }
    setInitialized(v) {
        this.initialized = v;
    }
    isUpdating() {
        return this.updating;
    }
    setUpdating(v) {
        this.updating = v;
    }
    getLive2DModel() {
        return this.live2DModel;
    }
    setLipSync(v) {
        this.lipSync = v;
    }
    setLipSyncValue(v) {
        this.lipSyncValue = v;
    }
    setAccel(x, y, z) {
        this.accelX = x;
        this.accelY = y;
        this.accelZ = z;
    }
    setDrag(x, y) {
        this.dragX = x;
        this.dragY = y;
    }
    getMainMotionManager() {
        return this.mainMotionManager;
    }
    getExpressionManager() {
        return this.expressionManager;
    }
    loadModelData(path, callback) {
        const pm = Live2DFramework.getPlatformManager();
        logger.info('Load model : ' + path);
        pm.loadLive2DModel(path, (l2dModel) => {
            this.live2DModel = l2dModel;
            this.live2DModel.saveParam();
            const _err = Live2D.getError();
            if (_err != 0) {
                logger.error('Error : Failed to loadModelData().');
                return;
            }
            this.modelMatrix = new L2DModelMatrix(this.live2DModel.getCanvasWidth(), this.live2DModel.getCanvasHeight());
            this.modelMatrix.setWidth(2);
            this.modelMatrix.setCenterPosition(0, 0);
            callback(this.live2DModel);
        });
    }
    loadTexture(no, path, callback) {
        texCounter++;
        const pm = Live2DFramework.getPlatformManager();
        logger.info('Load Texture : ' + path);
        pm.loadTexture(this.live2DModel, no, path, () => {
            texCounter--;
            if (texCounter == 0)
                this.isTexLoaded = true;
            if (typeof callback == 'function')
                callback();
        });
    }
    loadMotion(name, path, callback) {
        const pm = Live2DFramework.getPlatformManager();
        logger.trace('Load Motion : ' + path);
        let motion = null;
        pm.loadBytes(path, (buf) => {
            motion = Live2DMotion.loadMotion(buf);
            if (name != null) {
                this.motions[name] = motion;
            }
            callback(motion);
        });
    }
    loadExpression(name, path, callback) {
        const pm = Live2DFramework.getPlatformManager();
        logger.trace('Load Expression : ' + path);
        pm.loadBytes(path, (buf) => {
            if (name != null) {
                this.expressions[name] = L2DExpressionMotion.loadJson(buf);
            }
            if (typeof callback == 'function')
                callback();
        });
    }
    loadPose(path, callback) {
        const pm = Live2DFramework.getPlatformManager();
        logger.trace('Load Pose : ' + path);
        try {
            pm.loadBytes(path, (buf) => {
                this.pose = L2DPose.load(buf);
                if (typeof callback == 'function')
                    callback();
            });
        }
        catch (e) {
            logger.warn(e);
        }
    }
    loadPhysics(path) {
        const pm = Live2DFramework.getPlatformManager();
        logger.trace('Load Physics : ' + path);
        try {
            pm.loadBytes(path, (buf) => {
                this.physics = L2DPhysics.load(buf);
            });
        }
        catch (e) {
            logger.warn(e);
        }
    }
    hitTestSimple(drawID, testX, testY) {
        const drawIndex = this.live2DModel.getDrawDataIndex(drawID);
        if (drawIndex < 0)
            return false;
        const points = this.live2DModel.getTransformedPoints(drawIndex);
        let left = this.live2DModel.getCanvasWidth();
        let right = 0;
        let top = this.live2DModel.getCanvasHeight();
        let bottom = 0;
        for (let j = 0; j < points.length; j = j + 2) {
            const x = points[j];
            const y = points[j + 1];
            if (x < left)
                left = x;
            if (x > right)
                right = x;
            if (y < top)
                top = y;
            if (y > bottom)
                bottom = y;
        }
        const tx = this.modelMatrix.invertTransformX(testX);
        const ty = this.modelMatrix.invertTransformY(testY);
        return left <= tx && tx <= right && top <= ty && ty <= bottom;
    }
}
let texCounter = 0;
class L2DExpressionMotion extends AMotion {
    constructor() {
        super();
        this.paramList = [];
    }
    static loadJson(buf) {
        const ret = new L2DExpressionMotion();
        const pm = Live2DFramework.getPlatformManager();
        const json = pm.jsonParseFromBytes(buf);
        ret.setFadeIn(parseInt(json.fade_in) > 0 ? parseInt(json.fade_in) : 1000);
        ret.setFadeOut(parseInt(json.fade_out) > 0 ? parseInt(json.fade_out) : 1000);
        if (json.params == null) {
            return ret;
        }
        const params = json.params;
        const paramNum = params.length;
        ret.paramList = [];
        for (let i = 0; i < paramNum; i++) {
            const param = params[i];
            const paramID = param.id.toString();
            let value = parseFloat(param.val);
            let calcTypeInt = L2DExpressionMotion.TYPE_ADD;
            const calc = param.calc != null ? param.calc.toString() : 'add';
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
                let defaultValue = param.def == null ? 0 : parseFloat(param.def);
                value = value - defaultValue;
            }
            else if (calcTypeInt == L2DExpressionMotion.TYPE_MULT) {
                let defaultValue = param.def == null ? 1 : parseFloat(param.def);
                if (defaultValue == 0)
                    defaultValue = 1;
                value = value / defaultValue;
            }
            const item = new L2DExpressionParam();
            item.id = paramID;
            item.type = calcTypeInt;
            item.value = value;
            ret.paramList.push(item);
        }
        return ret;
    }
    updateParamExe(model, timeMSec, weight, motionQueueEnt) {
        for (let i = this.paramList.length - 1; i >= 0; --i) {
            const param = this.paramList[i];
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
    }
}
L2DExpressionMotion.EXPRESSION_DEFAULT = 'DEFAULT';
L2DExpressionMotion.TYPE_SET = 0;
L2DExpressionMotion.TYPE_ADD = 1;
L2DExpressionMotion.TYPE_MULT = 2;
function L2DExpressionParam() {
    this.id = '';
    this.type = -1;
    this.value = null;
}
class L2DEyeBlink {
    constructor() {
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
    calcNextBlink() {
        const time = UtSystem.getUserTimeMSec();
        const r = Math.random();
        return time + r * (2 * this.blinkIntervalMsec - 1);
    }
    setInterval(blinkIntervalMsec) {
        this.blinkIntervalMsec = blinkIntervalMsec;
    }
    setEyeMotion(closingMotionMsec, closedMotionMsec, openingMotionMsec) {
        this.closingMotionMsec = closingMotionMsec;
        this.closedMotionMsec = closedMotionMsec;
        this.openingMotionMsec = openingMotionMsec;
    }
    updateParam(model) {
        const time = UtSystem.getUserTimeMSec();
        let eyeParamValue;
        let t = 0;
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
    }
}
const EYE_STATE = () => { };
EYE_STATE.STATE_FIRST = 'STATE_FIRST';
EYE_STATE.STATE_INTERVAL = 'STATE_INTERVAL';
EYE_STATE.STATE_CLOSING = 'STATE_CLOSING';
EYE_STATE.STATE_CLOSED = 'STATE_CLOSED';
EYE_STATE.STATE_OPENING = 'STATE_OPENING';
class L2DMatrix44 {
    constructor() {
        this.tr = new Float32Array(16);
        this.identity();
    }
    static mul(a, b, dst) {
        const c = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        const n = 4;
        let i, j, k;
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
    }
    identity() {
        for (let i = 0; i < 16; i++)
            this.tr[i] = i % 5 == 0 ? 1 : 0;
    }
    getArray() {
        return this.tr;
    }
    getCopyMatrix() {
        return new Float32Array(this.tr);
    }
    setMatrix(tr) {
        if (this.tr == null || this.tr.length != this.tr.length)
            return;
        for (let i = 0; i < 16; i++)
            this.tr[i] = tr[i];
    }
    getScaleX() {
        return this.tr[0];
    }
    getScaleY() {
        return this.tr[5];
    }
    transformX(src) {
        return this.tr[0] * src + this.tr[12];
    }
    transformY(src) {
        return this.tr[5] * src + this.tr[13];
    }
    invertTransformX(src) {
        return (src - this.tr[12]) / this.tr[0];
    }
    invertTransformY(src) {
        return (src - this.tr[13]) / this.tr[5];
    }
    multTranslate(shiftX, shiftY) {
        const tr1 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, shiftX, shiftY, 0, 1];
        L2DMatrix44.mul(tr1, this.tr, this.tr);
    }
    translate(x, y) {
        this.tr[12] = x;
        this.tr[13] = y;
    }
    translateX(x) {
        this.tr[12] = x;
    }
    translateY(y) {
        this.tr[13] = y;
    }
    multScale(scaleX, scaleY) {
        const tr1 = [scaleX, 0, 0, 0, 0, scaleY, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        L2DMatrix44.mul(tr1, this.tr, this.tr);
    }
    scale(scaleX, scaleY) {
        this.tr[0] = scaleX;
        this.tr[5] = scaleY;
    }
}
class L2DModelMatrix extends L2DMatrix44 {
    constructor(w, h) {
        super();
        this.width = w;
        this.height = h;
    }
    setPosition(x, y) {
        this.translate(x, y);
    }
    setCenterPosition(x, y) {
        const w = this.width * this.getScaleX();
        const h = this.height * this.getScaleY();
        this.translate(x - w / 2, y - h / 2);
    }
    top(y) {
        this.setY(y);
    }
    bottom(y) {
        const h = this.height * this.getScaleY();
        this.translateY(y - h);
    }
    left(x) {
        this.setX(x);
    }
    right(x) {
        const w = this.width * this.getScaleX();
        this.translateX(x - w);
    }
    centerX(x) {
        const w = this.width * this.getScaleX();
        this.translateX(x - w / 2);
    }
    centerY(y) {
        const h = this.height * this.getScaleY();
        this.translateY(y - h / 2);
    }
    setX(x) {
        this.translateX(x);
    }
    setY(y) {
        this.translateY(y);
    }
    setHeight(h) {
        const scaleX = h / this.height;
        const scaleY = -scaleX;
        this.scale(scaleX, scaleY);
    }
    setWidth(w) {
        const scaleX = w / this.width;
        const scaleY = -scaleX;
        this.scale(scaleX, scaleY);
    }
}
class L2DMotionManager extends MotionQueueManager {
    constructor() {
        super();
        this.currentPriority = null;
        this.reservePriority = null;
        this.super = MotionQueueManager.prototype;
    }
    getCurrentPriority() {
        return this.currentPriority;
    }
    getReservePriority() {
        return this.reservePriority;
    }
    reserveMotion(priority) {
        if (this.reservePriority >= priority) {
            return false;
        }
        if (this.currentPriority >= priority) {
            return false;
        }
        this.reservePriority = priority;
        return true;
    }
    setReservePriority(val) {
        this.reservePriority = val;
    }
    updateParam(model) {
        const updated = MotionQueueManager.prototype.updateParam.call(this, model);
        if (this.isFinished()) {
            this.currentPriority = 0;
        }
        return updated;
    }
    startMotionPrio(motion, priority) {
        if (priority == this.reservePriority) {
            this.reservePriority = 0;
        }
        this.currentPriority = priority;
        return this.startMotion(motion, false);
    }
}
class L2DPhysics {
    constructor() {
        this.physicsList = [];
        this.startTimeMSec = UtSystem.getUserTimeMSec();
    }
    static load(buf) {
        const ret = new L2DPhysics();
        const pm = Live2DFramework.getPlatformManager();
        const json = pm.jsonParseFromBytes(buf);
        const params = json.physics_hair;
        const paramNum = params.length;
        for (let i = 0; i < paramNum; i++) {
            const param = params[i];
            const physics = new PhysicsHair();
            const setup = param.setup;
            const length = parseFloat(setup.length);
            const resist = parseFloat(setup.regist);
            const mass = parseFloat(setup.mass);
            physics.setup(length, resist, mass);
            const srcList = param.src;
            const srcNum = srcList.length;
            for (let j = 0; j < srcNum; j++) {
                const src = srcList[j];
                let id = src.id;
                let type = PhysicsHair.Src.SRC_TO_X;
                let typeStr = src.ptype;
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
                let scale = parseFloat(src.scale);
                let weight = parseFloat(src.weight);
                physics.addSrcParam(type, id, scale, weight);
            }
            const targetList = param.targets;
            const targetNum = targetList.length;
            for (let j = 0; j < targetNum; j++) {
                const target = targetList[j];
                let id = target.id;
                let type = PhysicsHair.Target.TARGET_FROM_ANGLE;
                let typeStr = target.ptype;
                if (typeStr === 'angle') {
                    type = PhysicsHair.Target.TARGET_FROM_ANGLE;
                }
                else if (typeStr === 'angle_v') {
                    type = PhysicsHair.Target.TARGET_FROM_ANGLE_V;
                }
                else {
                    UtDebug.error('live2d', 'Invalid parameter:PhysicsHair.Target');
                }
                let scale = parseFloat(target.scale);
                let weight = parseFloat(target.weight);
                physics.addTargetParam(type, id, scale, weight);
            }
            ret.physicsList.push(physics);
        }
        return ret;
    }
    updateParam(model) {
        const timeMSec = UtSystem.getUserTimeMSec() - this.startTimeMSec;
        for (let i = 0; i < this.physicsList.length; i++) {
            this.physicsList[i].update(model, timeMSec);
        }
    }
}
class L2DPose {
    constructor() {
        this.lastTime = 0;
        this.lastModel = null;
        this.partsGroups = [];
    }
    static load(buf) {
        const ret = new L2DPose();
        const pm = Live2DFramework.getPlatformManager();
        const json = pm.jsonParseFromBytes(buf);
        const poseListInfo = json.parts_visible;
        const poseNum = poseListInfo.length;
        for (let i_pose = 0; i_pose < poseNum; i_pose++) {
            const poseInfo = poseListInfo[i_pose];
            const idListInfo = poseInfo.group;
            const idNum = idListInfo.length;
            const partsGroup = [];
            for (let i_group = 0; i_group < idNum; i_group++) {
                const partsInfo = idListInfo[i_group];
                const parts = new L2DPartsParam(partsInfo.id);
                partsGroup[i_group] = parts;
                if (partsInfo.link == null)
                    continue;
                const linkListInfo = partsInfo.link;
                const linkNum = linkListInfo.length;
                parts.link = [];
                for (let i_link = 0; i_link < linkNum; i_link++) {
                    const linkParts = new L2DPartsParam(linkListInfo[i_link]);
                    parts.link.push(linkParts);
                }
            }
            ret.partsGroups.push(partsGroup);
        }
        return ret;
    }
    updateParam(model) {
        if (model == null)
            return;
        if (!(model == this.lastModel)) {
            this.initParam(model);
        }
        this.lastModel = model;
        const curTime = UtSystem.getUserTimeMSec();
        let deltaTimeSec = this.lastTime == 0 ? 0 : (curTime - this.lastTime) / 1000.0;
        this.lastTime = curTime;
        if (deltaTimeSec < 0)
            deltaTimeSec = 0;
        for (let i = 0; i < this.partsGroups.length; i++) {
            this.normalizePartsOpacityGroup(model, this.partsGroups[i], deltaTimeSec);
            this.copyOpacityOtherParts(model, this.partsGroups[i]);
        }
    }
    initParam(model) {
        if (model == null)
            return;
        for (let i = 0; i < this.partsGroups.length; i++) {
            const partsGroup = this.partsGroups[i];
            for (let j = 0; j < partsGroup.length; j++) {
                partsGroup[j].initIndex(model);
                const partsIndex = partsGroup[j].partsIndex;
                const paramIndex = partsGroup[j].paramIndex;
                if (partsIndex < 0)
                    continue;
                const v = model.getParamFloat(paramIndex) != 0;
                model.setPartsOpacity(partsIndex, v ? 1.0 : 0.0);
                model.setParamFloat(paramIndex, v ? 1.0 : 0.0);
                if (partsGroup[j].link == null)
                    continue;
                for (let k = 0; k < partsGroup[j].link.length; k++) {
                    partsGroup[j].link[k].initIndex(model);
                }
            }
        }
    }
    normalizePartsOpacityGroup(model, partsGroup, deltaTimeSec) {
        let visibleParts = -1;
        let visibleOpacity = 1.0;
        const CLEAR_TIME_SEC = 0.5;
        const phi = 0.5;
        const maxBackOpacity = 0.15;
        for (let i = 0; i < partsGroup.length; i++) {
            let partsIndex = partsGroup[i].partsIndex;
            const paramIndex = partsGroup[i].paramIndex;
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
        for (let i = 0; i < partsGroup.length; i++) {
            let partsIndex = partsGroup[i].partsIndex;
            if (partsIndex < 0)
                continue;
            if (visibleParts == i) {
                model.setPartsOpacity(partsIndex, visibleOpacity);
            }
            else {
                let opacity = model.getPartsOpacity(partsIndex);
                let a1;
                if (visibleOpacity < phi) {
                    a1 = (visibleOpacity * (phi - 1)) / phi + 1;
                }
                else {
                    a1 = ((1 - visibleOpacity) * phi) / (1 - phi);
                }
                const backOp = (1 - a1) * (1 - visibleOpacity);
                if (backOp > maxBackOpacity) {
                    a1 = 1 - maxBackOpacity / (1 - visibleOpacity);
                }
                if (opacity > a1) {
                    opacity = a1;
                }
                model.setPartsOpacity(partsIndex, opacity);
            }
        }
    }
    copyOpacityOtherParts(model, partsGroup) {
        for (let i_group = 0; i_group < partsGroup.length; i_group++) {
            const partsParam = partsGroup[i_group];
            if (partsParam.link == null)
                continue;
            if (partsParam.partsIndex < 0)
                continue;
            const opacity = model.getPartsOpacity(partsParam.partsIndex);
            for (let i_link = 0; i_link < partsParam.link.length; i_link++) {
                const linkParts = partsParam.link[i_link];
                if (linkParts.partsIndex < 0)
                    continue;
                model.setPartsOpacity(linkParts.partsIndex, opacity);
            }
        }
    }
}
class L2DPartsParam {
    constructor(id) {
        this.paramIndex = -1;
        this.partsIndex = -1;
        this.link = null;
        this.id = id;
    }
    initIndex(model) {
        this.paramIndex = model.getParamIndex('VISIBLE:' + this.id);
        this.partsIndex = model.getPartsDataIndex(PartsDataID.getID(this.id));
        model.setParamFloat(this.paramIndex, 1);
    }
}
class L2DTargetPoint {
    constructor() {
        this.EPSILON = 0.01;
        this.faceTargetX = 0;
        this.faceTargetY = 0;
        this.faceX = 0;
        this.faceY = 0;
        this.faceVX = 0;
        this.faceVY = 0;
        this.lastTimeSec = 0;
    }
    setPoint(x, y) {
        this.faceTargetX = x;
        this.faceTargetY = y;
    }
    getX() {
        return this.faceX;
    }
    getY() {
        return this.faceY;
    }
    update() {
        const TIME_TO_MAX_SPEED = 0.15;
        const FACE_PARAM_MAX_V = 40.0 / 7.5;
        const MAX_V = FACE_PARAM_MAX_V / L2DTargetPoint.FRAME_RATE;
        if (this.lastTimeSec == 0) {
            this.lastTimeSec = UtSystem.getUserTimeMSec();
            return;
        }
        const curTimeSec = UtSystem.getUserTimeMSec();
        const deltaTimeWeight = ((curTimeSec - this.lastTimeSec) * L2DTargetPoint.FRAME_RATE) / 1000.0;
        this.lastTimeSec = curTimeSec;
        const FRAME_TO_MAX_SPEED = TIME_TO_MAX_SPEED * L2DTargetPoint.FRAME_RATE;
        const MAX_A = (deltaTimeWeight * MAX_V) / FRAME_TO_MAX_SPEED;
        const dx = this.faceTargetX - this.faceX;
        const dy = this.faceTargetY - this.faceY;
        if (Math.abs(dx) <= this.EPSILON && Math.abs(dy) <= this.EPSILON)
            return;
        const d = Math.sqrt(dx * dx + dy * dy);
        const vx = (MAX_V * dx) / d;
        const vy = (MAX_V * dy) / d;
        let ax = vx - this.faceVX;
        let ay = vy - this.faceVY;
        let a = Math.sqrt(ax * ax + ay * ay);
        if (a < -MAX_A || a > MAX_A) {
            ax *= MAX_A / a;
            ay *= MAX_A / a;
            a = MAX_A;
        }
        this.faceVX += ax;
        this.faceVY += ay;
        {
            const max_v = 0.5 *
                (Math.sqrt(MAX_A * MAX_A + 16 * MAX_A * d - 8 * MAX_A * d) - MAX_A);
            const cur_v = Math.sqrt(this.faceVX * this.faceVX + this.faceVY * this.faceVY);
            if (cur_v > max_v) {
                this.faceVX *= max_v / cur_v;
                this.faceVY *= max_v / cur_v;
            }
        }
        this.faceX += this.faceVX;
        this.faceY += this.faceVY;
    }
}
L2DTargetPoint.FRAME_RATE = 30;
class L2DViewMatrix extends L2DMatrix44 {
    constructor() {
        super();
        this.screenLeft = null;
        this.screenRight = null;
        this.screenTop = null;
        this.screenBottom = null;
        this.maxLeft = null;
        this.maxRight = null;
        this.maxTop = null;
        this.maxBottom = null;
        this.max = Number.MAX_VALUE;
        this.min = 0;
    }
    getMaxScale() {
        return this.max;
    }
    getMinScale() {
        return this.min;
    }
    setMaxScale(v) {
        this.max = v;
    }
    setMinScale(v) {
        this.min = v;
    }
    isMaxScale() {
        return this.getScaleX() == this.max;
    }
    isMinScale() {
        return this.getScaleX() == this.min;
    }
    adjustTranslate(shiftX, shiftY) {
        if (this.tr[0] * this.maxLeft + (this.tr[12] + shiftX) > this.screenLeft)
            shiftX = this.screenLeft - this.tr[0] * this.maxLeft - this.tr[12];
        if (this.tr[0] * this.maxRight + (this.tr[12] + shiftX) < this.screenRight)
            shiftX = this.screenRight - this.tr[0] * this.maxRight - this.tr[12];
        if (this.tr[5] * this.maxTop + (this.tr[13] + shiftY) < this.screenTop)
            shiftY = this.screenTop - this.tr[5] * this.maxTop - this.tr[13];
        if (this.tr[5] * this.maxBottom + (this.tr[13] + shiftY) >
            this.screenBottom)
            shiftY = this.screenBottom - this.tr[5] * this.maxBottom - this.tr[13];
        const tr1 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, shiftX, shiftY, 0, 1];
        L2DMatrix44.mul(tr1, this.tr, this.tr);
    }
    adjustScale(cx, cy, scale) {
        const targetScale = scale * this.tr[0];
        if (targetScale < this.min) {
            if (this.tr[0] > 0)
                scale = this.min / this.tr[0];
        }
        else if (targetScale > this.max) {
            if (this.tr[0] > 0)
                scale = this.max / this.tr[0];
        }
        const tr1 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, cx, cy, 0, 1];
        const tr2 = [scale, 0, 0, 0, 0, scale, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        const tr3 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -cx, -cy, 0, 1];
        L2DMatrix44.mul(tr3, this.tr, this.tr);
        L2DMatrix44.mul(tr2, this.tr, this.tr);
        L2DMatrix44.mul(tr1, this.tr, this.tr);
    }
    setScreenRect(left, right, bottom, top) {
        this.screenLeft = left;
        this.screenRight = right;
        this.screenTop = top;
        this.screenBottom = bottom;
    }
    setMaxScreenRect(left, right, bottom, top) {
        this.maxLeft = left;
        this.maxRight = right;
        this.maxTop = top;
        this.maxBottom = bottom;
    }
    getScreenLeft() {
        return this.screenLeft;
    }
    getScreenRight() {
        return this.screenRight;
    }
    getScreenBottom() {
        return this.screenBottom;
    }
    getScreenTop() {
        return this.screenTop;
    }
    getMaxLeft() {
        return this.maxLeft;
    }
    getMaxRight() {
        return this.maxRight;
    }
    getMaxBottom() {
        return this.maxBottom;
    }
    getMaxTop() {
        return this.maxTop;
    }
}
class Live2DFramework {
    static getPlatformManager() {
        return Live2DFramework.platformManager;
    }
    static setPlatformManager(platformManager) {
        Live2DFramework.platformManager = platformManager;
    }
}
Live2DFramework.platformManager = null;
export { L2DBaseModel, L2DViewMatrix, L2DEyeBlink, Live2DFramework, L2DMatrix44, L2DTargetPoint };
