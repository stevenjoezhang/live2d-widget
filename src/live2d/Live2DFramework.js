/* global Live2D, Live2DMotion, AMotion, UtSystem, MotionQueueManager, PhysicsHair, UtDebug, PartsDataID */
/**
 *
 *  You can modify and use this source freely
 *  only for the development of application related Live2D.
 *
 *  (c) Live2D Inc. All rights reserved.
 */
import logger from '../logger.js';
//============================================================
//============================================================
//  class L2DBaseModel
//============================================================
//============================================================
class L2DBaseModel {
  constructor() {
    this.live2DModel = null; // ALive2DModel
    this.modelMatrix = null; // L2DModelMatrix
    this.eyeBlink = null; // L2DEyeBlink
    this.physics = null; // L2DPhysics
    this.pose = null; // L2DPose
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
    this.mainMotionManager = new L2DMotionManager(); //L2DMotionManager
    this.expressionManager = new L2DMotionManager(); //L2DMotionManager
    this.motions = {};
    this.expressions = {};

    this.isTexLoaded = false;
  }

  //============================================================
  //    L2DBaseModel # getModelMatrix()
  //============================================================
  getModelMatrix() {
    return this.modelMatrix;
  }

  //============================================================
  //    L2DBaseModel # setAlpha()
  //============================================================
  setAlpha(a /*float*/) {
    if (a > 0.999) a = 1;
    if (a < 0.001) a = 0;
    this.alpha = a;
  }

  //============================================================
  //    L2DBaseModel # getAlpha()
  //============================================================
  getAlpha() {
    return this.alpha;
  }

  //============================================================
  //    L2DBaseModel # isInitialized()
  //============================================================
  isInitialized() {
    return this.initialized;
  }

  //============================================================
  //    L2DBaseModel # setInitialized()
  //============================================================
  setInitialized(v /*boolean*/) {
    this.initialized = v;
  }

  //============================================================
  //    L2DBaseModel # isUpdating()
  //============================================================
  isUpdating() {
    return this.updating;
  }

  //============================================================
  //    L2DBaseModel # setUpdating()
  //============================================================
  setUpdating(v /*boolean*/) {
    this.updating = v;
  }

  //============================================================
  //    L2DBaseModel # getLive2DModel()
  //============================================================
  getLive2DModel() {
    return this.live2DModel;
  }

  //============================================================
  //    L2DBaseModel # setLipSync()
  //============================================================
  setLipSync(v /*boolean*/) {
    this.lipSync = v;
  }

  //============================================================
  //    L2DBaseModel # setLipSyncValue()
  //============================================================
  setLipSyncValue(v /*float*/) {
    this.lipSyncValue = v;
  }

  //============================================================
  //    L2DBaseModel # setAccel()
  //============================================================
  setAccel(x /*float*/, y /*float*/, z /*float*/) {
    this.accelX = x;
    this.accelY = y;
    this.accelZ = z;
  }

  //============================================================
  //    L2DBaseModel # setDrag()
  //============================================================
  setDrag(x /*float*/, y /*float*/) {
    this.dragX = x;
    this.dragY = y;
  }

  //============================================================
  //    L2DBaseModel # getMainMotionManager()
  //============================================================
  getMainMotionManager() {
    return this.mainMotionManager;
  }

  //============================================================
  //    L2DBaseModel # getExpressionManager()
  //============================================================
  getExpressionManager() {
    return this.expressionManager;
  }

  //============================================================
  //    L2DBaseModel # loadModelData()
  //============================================================
  loadModelData(path /*String*/, callback) {
    /*
        if( this.live2DModel != null ) {
            this.live2DModel.deleteTextures();
        }
        */
    const pm = Live2DFramework.getPlatformManager(); //IPlatformManager
    logger.info('Load model : ' + path);

    pm.loadLive2DModel(path, (l2dModel) => {
      this.live2DModel = l2dModel;
      this.live2DModel.saveParam();

      const _err = Live2D.getError();

      if (_err != 0) {
        logger.error('Error : Failed to loadModelData().');
        return;
      }

      this.modelMatrix = new L2DModelMatrix(
        this.live2DModel.getCanvasWidth(),
        this.live2DModel.getCanvasHeight(),
      ); //L2DModelMatrix
      this.modelMatrix.setWidth(2);
      this.modelMatrix.setCenterPosition(0, 0);

      callback(this.live2DModel);
    });
  }

  //============================================================
  //    L2DBaseModel # loadTexture()
  //============================================================
  loadTexture(no /*int*/, path /*String*/, callback) {
    texCounter++;

    const pm = Live2DFramework.getPlatformManager(); //IPlatformManager

    logger.info('Load Texture : ' + path);

    pm.loadTexture(this.live2DModel, no, path, () => {
      texCounter--;
      if (texCounter == 0) this.isTexLoaded = true;
      if (typeof callback == 'function') callback();
    });
  }

  //============================================================
  //    L2DBaseModel # loadMotion()
  //============================================================
  loadMotion(name /*String*/, path /*String*/, callback) {
    const pm = Live2DFramework.getPlatformManager(); //IPlatformManager

    logger.trace('Load Motion : ' + path);

    let motion = null; //Live2DMotion

    pm.loadBytes(path, (buf) => {
      motion = Live2DMotion.loadMotion(buf);
      if (name != null) {
        this.motions[name] = motion;
      }
      callback(motion);
    });
  }

  //============================================================
  //    L2DBaseModel # loadExpression()
  //============================================================
  loadExpression(name /*String*/, path /*String*/, callback) {
    const pm = Live2DFramework.getPlatformManager(); //IPlatformManager

    logger.trace('Load Expression : ' + path);

    pm.loadBytes(path, (buf) => {
      if (name != null) {
        this.expressions[name] = L2DExpressionMotion.loadJson(buf);
      }
      if (typeof callback == 'function') callback();
    });
  }

  //============================================================
  //    L2DBaseModel # loadPose()
  //============================================================
  loadPose(path /*String*/, callback) {
    const pm = Live2DFramework.getPlatformManager(); //IPlatformManager
    logger.trace('Load Pose : ' + path);
    try {
      pm.loadBytes(path, (buf) => {
        this.pose = L2DPose.load(buf);
        if (typeof callback == 'function') callback();
      });
    } catch (e) {
      logger.warn(e);
    }
  }

  //============================================================
  //    L2DBaseModel # loadPhysics()
  //============================================================
  loadPhysics(path /*String*/) {
    const pm = Live2DFramework.getPlatformManager(); //IPlatformManager
    logger.trace('Load Physics : ' + path);
    try {
      pm.loadBytes(path, (buf) => {
        this.physics = L2DPhysics.load(buf);
      });
    } catch (e) {
      logger.warn(e);
    }
  }

  //============================================================
  //    L2DBaseModel # hitTestSimple()
  //============================================================
  hitTestSimple(drawID, testX, testY) {
    const drawIndex = this.live2DModel.getDrawDataIndex(drawID);

    if (drawIndex < 0) return false;

    const points = this.live2DModel.getTransformedPoints(drawIndex);
    let left = this.live2DModel.getCanvasWidth();
    let right = 0;
    let top = this.live2DModel.getCanvasHeight();
    let bottom = 0;

    for (let j = 0; j < points.length; j = j + 2) {
      const x = points[j];
      const y = points[j + 1];

      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
    const tx = this.modelMatrix.invertTransformX(testX);
    const ty = this.modelMatrix.invertTransformY(testY);

    return left <= tx && tx <= right && top <= ty && ty <= bottom;
  }
}

let texCounter = 0;

/**
 *
 *  You can modify and use this source freely
 *  only for the development of application related Live2D.
 *
 *  (c) Live2D Inc. All rights reserved.
 */

//============================================================
//============================================================
//  class L2DExpressionMotion  extends     AMotion
//============================================================
//============================================================
class L2DExpressionMotion extends AMotion {
  constructor() {
    super();
    this.paramList = []; //ArrayList<L2DExpressionParam>
  }

  //============================================================
  //    static L2DExpressionMotion.loadJson()
  //============================================================
  static loadJson(buf) {
    const ret = new L2DExpressionMotion();

    const pm = Live2DFramework.getPlatformManager();
    const json = pm.jsonParseFromBytes(buf);

    ret.setFadeIn(parseInt(json.fade_in) > 0 ? parseInt(json.fade_in) : 1000);
    ret.setFadeOut(
      parseInt(json.fade_out) > 0 ? parseInt(json.fade_out) : 1000,
    );

    if (json.params == null) {
      return ret;
    }

    const params = json.params;
    const paramNum = params.length;
    ret.paramList = []; //ArrayList<L2DExpressionParam>
    for (let i = 0; i < paramNum; i++) {
      const param = params[i];
      const paramID = param.id.toString();
      let value = parseFloat(param.val);
      let calcTypeInt = L2DExpressionMotion.TYPE_ADD;
      const calc = param.calc != null ? param.calc.toString() : 'add';
      if (calc === 'add') {
        calcTypeInt = L2DExpressionMotion.TYPE_ADD;
      } else if (calc === 'mult') {
        calcTypeInt = L2DExpressionMotion.TYPE_MULT;
      } else if (calc === 'set') {
        calcTypeInt = L2DExpressionMotion.TYPE_SET;
      } else {
        calcTypeInt = L2DExpressionMotion.TYPE_ADD;
      }
      if (calcTypeInt == L2DExpressionMotion.TYPE_ADD) {
        let defaultValue = param.def == null ? 0 : parseFloat(param.def);
        value = value - defaultValue;
      } else if (calcTypeInt == L2DExpressionMotion.TYPE_MULT) {
        let defaultValue = param.def == null ? 1 : parseFloat(param.def);
        if (defaultValue == 0) defaultValue = 1;
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

  //============================================================
  //    L2DExpressionMotion # updateParamExe()
  //============================================================
  updateParamExe(
    model /*ALive2DModel*/,
    timeMSec /*long*/,
    weight /*float*/,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    motionQueueEnt /*MotionQueueEnt*/,
  ) {
    for (let i = this.paramList.length - 1; i >= 0; --i) {
      const param = this.paramList[i]; //L2DExpressionParam
      // if (!param || !param.type) continue;
      if (param.type == L2DExpressionMotion.TYPE_ADD) {
        model.addToParamFloat(param.id, param.value, weight);
      } else if (param.type == L2DExpressionMotion.TYPE_MULT) {
        model.multParamFloat(param.id, param.value, weight);
      } else if (param.type == L2DExpressionMotion.TYPE_SET) {
        model.setParamFloat(param.id, param.value, weight);
      }
    }
  }
}

//============================================================
L2DExpressionMotion.EXPRESSION_DEFAULT = 'DEFAULT';
L2DExpressionMotion.TYPE_SET = 0;
L2DExpressionMotion.TYPE_ADD = 1;
L2DExpressionMotion.TYPE_MULT = 2;

//============================================================
//============================================================
//  class L2DExpressionParam
//============================================================
//============================================================
function L2DExpressionParam() {
  this.id = '';
  this.type = -1;
  this.value = null;
}

/**
 *
 *  You can modify and use this source freely
 *  only for the development of application related Live2D.
 *
 *  (c) Live2D Inc. All rights reserved.
 */

//============================================================
//============================================================
//  class L2DEyeBlink
//============================================================
//============================================================
class L2DEyeBlink {
  constructor() {
    this.nextBlinkTime = null /* TODO NOT INIT */; //
    this.stateStartTime = null /* TODO NOT INIT */; //
    this.blinkIntervalMsec = null /* TODO NOT INIT */; //
    this.eyeState = EYE_STATE.STATE_FIRST;
    this.blinkIntervalMsec = 4000;
    this.closingMotionMsec = 100;
    this.closedMotionMsec = 50;
    this.openingMotionMsec = 150;
    this.closeIfZero = true;
    this.eyeID_L = 'PARAM_EYE_L_OPEN';
    this.eyeID_R = 'PARAM_EYE_R_OPEN';
  }

  //============================================================
  //    L2DEyeBlink # calcNextBlink()
  //============================================================
  calcNextBlink() {
    const time /*long*/ = UtSystem.getUserTimeMSec();
    const r /*Number*/ = Math.random();
    return /*(long)*/ time + r * (2 * this.blinkIntervalMsec - 1);
  }

  //============================================================
  //    L2DEyeBlink # setInterval()
  //============================================================
  setInterval(blinkIntervalMsec /*int*/) {
    this.blinkIntervalMsec = blinkIntervalMsec;
  }

  //============================================================
  //    L2DEyeBlink # setEyeMotion()
  //============================================================
  setEyeMotion(
    closingMotionMsec /*int*/,
    closedMotionMsec /*int*/,
    openingMotionMsec /*int*/,
  ) {
    this.closingMotionMsec = closingMotionMsec;
    this.closedMotionMsec = closedMotionMsec;
    this.openingMotionMsec = openingMotionMsec;
  }

  //============================================================
  //    L2DEyeBlink # updateParam()
  //============================================================
  updateParam(model /*ALive2DModel*/) {
    const time /*:long*/ = UtSystem.getUserTimeMSec();
    let eyeParamValue /*:Number*/;
    let t /*:Number*/ = 0;
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
    if (!this.closeIfZero) eyeParamValue = -eyeParamValue;
    model.setParamFloat(this.eyeID_L, eyeParamValue);
    model.setParamFloat(this.eyeID_R, eyeParamValue);
  }
}

//== enum EYE_STATE ==
const EYE_STATE = () => { };

EYE_STATE.STATE_FIRST = 'STATE_FIRST';
EYE_STATE.STATE_INTERVAL = 'STATE_INTERVAL';
EYE_STATE.STATE_CLOSING = 'STATE_CLOSING';
EYE_STATE.STATE_CLOSED = 'STATE_CLOSED';
EYE_STATE.STATE_OPENING = 'STATE_OPENING';

/**
 *
 *  You can modify and use this source freely
 *  only for the development of application related Live2D.
 *
 *  (c) Live2D Inc. All rights reserved.
 */

//============================================================
//============================================================
//  class L2DMatrix44
//============================================================
//============================================================
class L2DMatrix44 {
  constructor() {
    this.tr = new Float32Array(16); //
    this.identity();
  }

  //============================================================
  //    static L2DMatrix44.mul()
  //============================================================
  static mul(a /*float[]*/, b /*float[]*/, dst /*float[]*/) {
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

  //============================================================
  //    L2DMatrix44 # identity()
  //============================================================
  identity() {
    for (let i /*:int*/ = 0; i < 16; i++) this.tr[i] = i % 5 == 0 ? 1 : 0;
  }

  //============================================================
  //    L2DMatrix44 # getArray()
  //============================================================
  getArray() {
    return this.tr;
  }

  //============================================================
  //    L2DMatrix44 # getCopyMatrix()
  //============================================================
  getCopyMatrix() {
    return new Float32Array(this.tr); // this.tr.clone();
  }

  //============================================================
  //    L2DMatrix44 # setMatrix()
  //============================================================
  setMatrix(tr /*float[]*/) {
    if (this.tr == null || this.tr.length != this.tr.length) return;
    for (let i /*:int*/ = 0; i < 16; i++) this.tr[i] = tr[i];
  }

  //============================================================
  //    L2DMatrix44 # getScaleX()
  //============================================================
  getScaleX() {
    return this.tr[0];
  }

  //============================================================
  //    L2DMatrix44 # getScaleY()
  //============================================================
  getScaleY() {
    return this.tr[5];
  }

  //============================================================
  //    L2DMatrix44 # transformX()
  //============================================================
  transformX(src /*float*/) {
    return this.tr[0] * src + this.tr[12];
  }

  //============================================================
  //    L2DMatrix44 # transformY()
  //============================================================
  transformY(src /*float*/) {
    return this.tr[5] * src + this.tr[13];
  }

  //============================================================
  //    L2DMatrix44 # invertTransformX()
  //============================================================
  invertTransformX(src /*float*/) {
    return (src - this.tr[12]) / this.tr[0];
  }

  //============================================================
  //    L2DMatrix44 # invertTransformY()
  //============================================================
  invertTransformY(src /*float*/) {
    return (src - this.tr[13]) / this.tr[5];
  }

  //============================================================
  //    L2DMatrix44 # multTranslate()
  //============================================================
  multTranslate(shiftX /*float*/, shiftY /*float*/) {
    const tr1 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, shiftX, shiftY, 0, 1];
    L2DMatrix44.mul(tr1, this.tr, this.tr);
  }

  //============================================================
  //    L2DMatrix44 # translate()
  //============================================================
  translate(x /*float*/, y /*float*/) {
    this.tr[12] = x;
    this.tr[13] = y;
  }

  //============================================================
  //    L2DMatrix44 # translateX()
  //============================================================
  translateX(x /*float*/) {
    this.tr[12] = x;
  }

  //============================================================
  //    L2DMatrix44 # translateY()
  //============================================================
  translateY(y /*float*/) {
    this.tr[13] = y;
  }

  //============================================================
  //    L2DMatrix44 # multScale()
  //============================================================
  multScale(scaleX /*float*/, scaleY /*float*/) {
    const tr1 = [scaleX, 0, 0, 0, 0, scaleY, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    L2DMatrix44.mul(tr1, this.tr, this.tr);
  }

  //============================================================
  //    L2DMatrix44 # scale()
  //============================================================
  scale(scaleX /*float*/, scaleY /*float*/) {
    this.tr[0] = scaleX;
    this.tr[5] = scaleY;
  }
}

/**
 *
 *  You can modify and use this source freely
 *  only for the development of application related Live2D.
 *
 *  (c) Live2D Inc. All rights reserved.
 */

//============================================================
//============================================================
//  class L2DModelMatrix       extends     L2DMatrix44
//============================================================
//============================================================
class L2DModelMatrix extends L2DMatrix44 {
  constructor(w /*float*/, h /*float*/) {
    super();
    this.width = w;
    this.height = h;
  }

  //============================================================
  //    L2DModelMatrix # setPosition()
  //============================================================
  setPosition(x /*float*/, y /*float*/) {
    this.translate(x, y);
  }

  //============================================================
  //    L2DModelMatrix # setCenterPosition()
  //============================================================
  setCenterPosition(x /*float*/, y /*float*/) {
    const w = this.width * this.getScaleX();
    const h = this.height * this.getScaleY();
    this.translate(x - w / 2, y - h / 2);
  }

  //============================================================
  //    L2DModelMatrix # top()
  //============================================================
  top(y /*float*/) {
    this.setY(y);
  }

  //============================================================
  //    L2DModelMatrix # bottom()
  //============================================================
  bottom(y /*float*/) {
    const h = this.height * this.getScaleY();
    this.translateY(y - h);
  }

  //============================================================
  //    L2DModelMatrix # left()
  //============================================================
  left(x /*float*/) {
    this.setX(x);
  }

  //============================================================
  //    L2DModelMatrix # right()
  //============================================================
  right(x /*float*/) {
    const w = this.width * this.getScaleX();
    this.translateX(x - w);
  }

  //============================================================
  //    L2DModelMatrix # centerX()
  //============================================================
  centerX(x /*float*/) {
    const w = this.width * this.getScaleX();
    this.translateX(x - w / 2);
  }

  //============================================================
  //    L2DModelMatrix # centerY()
  //============================================================
  centerY(y /*float*/) {
    const h = this.height * this.getScaleY();
    this.translateY(y - h / 2);
  }

  //============================================================
  //    L2DModelMatrix # setX()
  //============================================================
  setX(x /*float*/) {
    this.translateX(x);
  }

  //============================================================
  //    L2DModelMatrix # setY()
  //============================================================
  setY(y /*float*/) {
    this.translateY(y);
  }

  //============================================================
  //    L2DModelMatrix # setHeight()
  //============================================================
  setHeight(h /*float*/) {
    const scaleX = h / this.height;
    const scaleY = -scaleX;
    this.scale(scaleX, scaleY);
  }

  //============================================================
  //    L2DModelMatrix # setWidth()
  //============================================================
  setWidth(w /*float*/) {
    const scaleX = w / this.width;
    const scaleY = -scaleX;
    this.scale(scaleX, scaleY);
  }
}

/**
 *
 *  You can modify and use this source freely
 *  only for the development of application related Live2D.
 *
 *  (c) Live2D Inc. All rights reserved.
 */

//============================================================
//============================================================
//  class L2DMotionManager     extends     MotionQueueManager
//============================================================
//============================================================
class L2DMotionManager extends MotionQueueManager {
  constructor() {
    super();
    this.currentPriority = null;
    this.reservePriority = null;

    this.super = MotionQueueManager.prototype;
  }

  //============================================================
  //    L2DMotionManager # getCurrentPriority()
  //============================================================
  getCurrentPriority() {
    return this.currentPriority;
  }

  //============================================================
  //    L2DMotionManager # getReservePriority()
  //============================================================
  getReservePriority() {
    return this.reservePriority;
  }

  //============================================================
  //    L2DMotionManager # reserveMotion()
  //============================================================
  reserveMotion(priority /*int*/) {
    if (this.reservePriority >= priority) {
      return false;
    }
    if (this.currentPriority >= priority) {
      return false;
    }

    this.reservePriority = priority;

    return true;
  }

  //============================================================
  //    L2DMotionManager # setReservePriority()
  //============================================================
  setReservePriority(val /*int*/) {
    this.reservePriority = val;
  }

  //============================================================
  //    L2DMotionManager # updateParam()
  //============================================================
  updateParam(model /*ALive2DModel*/) {
    const updated = MotionQueueManager.prototype.updateParam.call(this, model);

    if (this.isFinished()) {
      this.currentPriority = 0;
    }

    return updated;
  }

  //============================================================
  //    L2DMotionManager # startMotionPrio()
  //============================================================
  startMotionPrio(motion /*AMotion*/, priority /*int*/) {
    if (priority == this.reservePriority) {
      this.reservePriority = 0;
    }
    this.currentPriority = priority;
    return this.startMotion(motion, false);
  }
}

/**
 *
 *  You can modify and use this source freely
 *  only for the development of application related Live2D.
 *
 *  (c) Live2D Inc. All rights reserved.
 */

//============================================================
//============================================================
//  class L2DPhysics
//============================================================
//============================================================
class L2DPhysics {
  constructor() {
    this.physicsList = []; //ArrayList<PhysicsHair>
    this.startTimeMSec = UtSystem.getUserTimeMSec();
  }

  //============================================================
  //    static L2DPhysics.load()
  //============================================================
  static load(buf /*byte[]*/) {
    const ret = new L2DPhysics(); //L2DPhysicsL2DPhysics
    const pm = Live2DFramework.getPlatformManager();
    const json = pm.jsonParseFromBytes(buf);
    const params = json.physics_hair;
    const paramNum = params.length;
    for (let i = 0; i < paramNum; i++) {
      const param = params[i]; //Value
      const physics = new PhysicsHair(); //PhysicsHairPhysicsHair
      const setup = param.setup; //Value
      const length = parseFloat(setup.length);
      const resist = parseFloat(setup.regist);
      const mass = parseFloat(setup.mass);
      physics.setup(length, resist, mass);
      const srcList = param.src; //Value
      const srcNum = srcList.length;
      for (let j = 0; j < srcNum; j++) {
        const src = srcList[j]; //Value
        let id = src.id; //String
        let type = PhysicsHair.Src.SRC_TO_X;
        let typeStr = src.ptype; //String
        if (typeStr === 'x') {
          type = PhysicsHair.Src.SRC_TO_X;
        } else if (typeStr === 'y') {
          type = PhysicsHair.Src.SRC_TO_Y;
        } else if (typeStr === 'angle') {
          type = PhysicsHair.Src.SRC_TO_G_ANGLE;
        } else {
          UtDebug.error('live2d', 'Invalid parameter:PhysicsHair.Src');
        }
        let scale = parseFloat(src.scale);
        let weight = parseFloat(src.weight);
        physics.addSrcParam(type, id, scale, weight);
      }
      const targetList = param.targets; //Value
      const targetNum = targetList.length;
      for (let j = 0; j < targetNum; j++) {
        const target = targetList[j]; //Value
        let id = target.id; //String
        let type = PhysicsHair.Target.TARGET_FROM_ANGLE;
        let typeStr = target.ptype; //String
        if (typeStr === 'angle') {
          type = PhysicsHair.Target.TARGET_FROM_ANGLE;
        } else if (typeStr === 'angle_v') {
          type = PhysicsHair.Target.TARGET_FROM_ANGLE_V;
        } else {
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

  //============================================================
  //    L2DPhysics # updateParam()
  //============================================================
  updateParam(model /*ALive2DModel*/) {
    const timeMSec = UtSystem.getUserTimeMSec() - this.startTimeMSec;
    for (let i = 0; i < this.physicsList.length; i++) {
      this.physicsList[i].update(model, timeMSec);
    }
  }
}

/**
 *
 *  You can modify and use this source freely
 *  only for the development of application related Live2D.
 *
 *  (c) Live2D Inc. All rights reserved.
 */

//============================================================
//============================================================
//  class L2DPose
//============================================================
//============================================================
class L2DPose {
  constructor() {
    this.lastTime = 0;
    this.lastModel = null; //ALive2DModel
    this.partsGroups = []; //ArrayList<L2DPartsParam[]>
  }

  //============================================================
  //    static L2DPose.load()
  //============================================================
  static load(buf /*byte[]*/) {
    const ret = new L2DPose(); //L2DPose
    const pm = Live2DFramework.getPlatformManager();
    const json = pm.jsonParseFromBytes(buf);
    const poseListInfo = json.parts_visible; //Value
    const poseNum = poseListInfo.length;
    for (let i_pose = 0; i_pose < poseNum; i_pose++) {
      const poseInfo = poseListInfo[i_pose]; //Value
      const idListInfo = poseInfo.group; //Value
      const idNum = idListInfo.length;
      const partsGroup /*L2DPartsParam*/ = [];
      for (let i_group = 0; i_group < idNum; i_group++) {
        const partsInfo = idListInfo[i_group]; //Value
        const parts = new L2DPartsParam(partsInfo.id); //L2DPartsParamL2DPartsParam
        partsGroup[i_group] = parts;
        if (partsInfo.link == null) continue;
        const linkListInfo = partsInfo.link; //Value
        const linkNum = linkListInfo.length;
        parts.link = []; //ArrayList<L2DPartsParam>
        for (let i_link = 0; i_link < linkNum; i_link++) {
          const linkParts = new L2DPartsParam(linkListInfo[i_link]); //L2DPartsParamL2DPartsParam
          parts.link.push(linkParts);
        }
      }
      ret.partsGroups.push(partsGroup);
    }

    return ret;
  }

  //============================================================
  //    L2DPose # updateParam()
  //============================================================
  updateParam(model /*ALive2DModel*/) {
    if (model == null) return;

    if (!(model == this.lastModel)) {
      this.initParam(model);
    }
    this.lastModel = model;

    const curTime = UtSystem.getUserTimeMSec();
    let deltaTimeSec =
      this.lastTime == 0 ? 0 : (curTime - this.lastTime) / 1000.0;
    this.lastTime = curTime;
    if (deltaTimeSec < 0) deltaTimeSec = 0;
    for (let i = 0; i < this.partsGroups.length; i++) {
      this.normalizePartsOpacityGroup(model, this.partsGroups[i], deltaTimeSec);
      this.copyOpacityOtherParts(model, this.partsGroups[i]);
    }
  }

  //============================================================
  //    L2DPose # initParam()
  //============================================================
  initParam(model /*ALive2DModel*/) {
    if (model == null) return;
    for (let i = 0; i < this.partsGroups.length; i++) {
      const partsGroup = this.partsGroups[i]; //L2DPartsParam
      for (let j = 0; j < partsGroup.length; j++) {
        partsGroup[j].initIndex(model);
        const partsIndex = partsGroup[j].partsIndex;
        const paramIndex = partsGroup[j].paramIndex;
        if (partsIndex < 0) continue;
        const v /*:Boolean*/ = model.getParamFloat(paramIndex) != 0;
        model.setPartsOpacity(partsIndex, v ? 1.0 : 0.0);
        model.setParamFloat(paramIndex, v ? 1.0 : 0.0);
        if (partsGroup[j].link == null) continue;
        for (let k = 0; k < partsGroup[j].link.length; k++) {
          partsGroup[j].link[k].initIndex(model);
        }
      }
    }
  }

  //============================================================
  //    L2DPose # normalizePartsOpacityGroup()
  //============================================================
  normalizePartsOpacityGroup(
    model /*ALive2DModel*/,
    partsGroup /*L2DPartsParam[]*/,
    deltaTimeSec /*float*/,
  ) {
    let visibleParts = -1;
    let visibleOpacity = 1.0;
    const CLEAR_TIME_SEC = 0.5;
    const phi = 0.5;
    const maxBackOpacity = 0.15;
    for (let i = 0; i < partsGroup.length; i++) {
      let partsIndex = partsGroup[i].partsIndex;
      const paramIndex = partsGroup[i].paramIndex;
      if (partsIndex < 0) continue;
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
      if (partsIndex < 0) continue;
      if (visibleParts == i) {
        model.setPartsOpacity(partsIndex, visibleOpacity);
      } else {
        let opacity = model.getPartsOpacity(partsIndex);
        let a1;
        if (visibleOpacity < phi) {
          a1 = (visibleOpacity * (phi - 1)) / phi + 1;
        } else {
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

  //============================================================
  //    L2DPose # copyOpacityOtherParts()
  //============================================================
  copyOpacityOtherParts(
    model /*ALive2DModel*/,
    partsGroup /*L2DPartsParam[]*/,
  ) {
    for (let i_group = 0; i_group < partsGroup.length; i_group++) {
      const partsParam = partsGroup[i_group]; //L2DPartsParam
      if (partsParam.link == null) continue;
      if (partsParam.partsIndex < 0) continue;
      const opacity = model.getPartsOpacity(partsParam.partsIndex);
      for (let i_link = 0; i_link < partsParam.link.length; i_link++) {
        const linkParts = partsParam.link[i_link]; //L2DPartsParam
        if (linkParts.partsIndex < 0) continue;
        model.setPartsOpacity(linkParts.partsIndex, opacity);
      }
    }
  }
}

//============================================================
//============================================================
//  class L2DPartsParam
//============================================================
//============================================================
class L2DPartsParam {
  constructor(id /*String*/) {
    this.paramIndex = -1;
    this.partsIndex = -1;
    this.link = null; // ArrayList<L2DPartsParam>
    this.id = id;
  }

  //============================================================
  //    L2DPartsParam # initIndex()
  //============================================================
  initIndex(model /*ALive2DModel*/) {
    this.paramIndex = model.getParamIndex('VISIBLE:' + this.id);
    this.partsIndex = model.getPartsDataIndex(PartsDataID.getID(this.id));
    model.setParamFloat(this.paramIndex, 1);
  }
}

/**
 *
 *  You can modify and use this source freely
 *  only for the development of application related Live2D.
 *
 *  (c) Live2D Inc. All rights reserved.
 */

//============================================================
//============================================================
//  class L2DTargetPoint
//============================================================
//============================================================
class L2DTargetPoint {
  constructor() {
    this.EPSILON = 0.01; // 変化の最小値（この値以下は無視される）
    this.faceTargetX = 0;
    this.faceTargetY = 0;
    this.faceX = 0;
    this.faceY = 0;
    this.faceVX = 0;
    this.faceVY = 0;
    this.lastTimeSec = 0;
  }

  //============================================================
  //    L2DTargetPoint # set()
  //============================================================
  setPoint(x /*float*/, y /*float*/) {
    this.faceTargetX = x;
    this.faceTargetY = y;
  }

  //============================================================
  //    L2DTargetPoint # getX()
  //============================================================
  getX() {
    return this.faceX;
  }

  //============================================================
  //    L2DTargetPoint # getY()
  //============================================================
  getY() {
    return this.faceY;
  }

  //============================================================
  //    L2DTargetPoint # update()
  //============================================================
  update() {
    const TIME_TO_MAX_SPEED = 0.15;
    const FACE_PARAM_MAX_V = 40.0 / 7.5;
    const MAX_V = FACE_PARAM_MAX_V / L2DTargetPoint.FRAME_RATE;
    if (this.lastTimeSec == 0) {
      this.lastTimeSec = UtSystem.getUserTimeMSec();
      return;
    }
    const curTimeSec = UtSystem.getUserTimeMSec();
    const deltaTimeWeight =
      ((curTimeSec - this.lastTimeSec) * L2DTargetPoint.FRAME_RATE) / 1000.0;
    this.lastTimeSec = curTimeSec;
    const FRAME_TO_MAX_SPEED = TIME_TO_MAX_SPEED * L2DTargetPoint.FRAME_RATE;
    const MAX_A = (deltaTimeWeight * MAX_V) / FRAME_TO_MAX_SPEED;
    const dx = this.faceTargetX - this.faceX;
    const dy = this.faceTargetY - this.faceY;
    // if(dx == 0 && dy == 0) return;
    if (Math.abs(dx) <= this.EPSILON && Math.abs(dy) <= this.EPSILON) return;
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
      const max_v =
        0.5 *
        (Math.sqrt(MAX_A * MAX_A + 16 * MAX_A * d - 8 * MAX_A * d) - MAX_A);
      const cur_v = Math.sqrt(
        this.faceVX * this.faceVX + this.faceVY * this.faceVY,
      );
      if (cur_v > max_v) {
        this.faceVX *= max_v / cur_v;
        this.faceVY *= max_v / cur_v;
      }
    }
    this.faceX += this.faceVX;
    this.faceY += this.faceVY;
  }
}

//============================================================
L2DTargetPoint.FRAME_RATE = 30;

/**
 *
 *  You can modify and use this source freely
 *  only for the development of application related Live2D.
 *
 *  (c) Live2D Inc. All rights reserved.
 */

//============================================================
//============================================================
//  class L2DViewMatrix        extends     L2DMatrix44
//============================================================
//============================================================
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

  //============================================================
  //    L2DViewMatrix # getMaxScale()
  //============================================================
  getMaxScale() {
    return this.max;
  }

  //============================================================
  //    L2DViewMatrix # getMinScale()
  //============================================================
  getMinScale() {
    return this.min;
  }

  //============================================================
  //    L2DViewMatrix # setMaxScale()
  //============================================================
  setMaxScale(v /*float*/) {
    this.max = v;
  }

  //============================================================
  //    L2DViewMatrix # setMinScale()
  //============================================================
  setMinScale(v /*float*/) {
    this.min = v;
  }

  //============================================================
  //    L2DViewMatrix # isMaxScale()
  //============================================================
  isMaxScale() {
    return this.getScaleX() == this.max;
  }

  //============================================================
  //    L2DViewMatrix # isMinScale()
  //============================================================
  isMinScale() {
    return this.getScaleX() == this.min;
  }

  //============================================================
  //    L2DViewMatrix # adjustTranslate()
  //============================================================
  adjustTranslate(shiftX /*float*/, shiftY /*float*/) {
    if (this.tr[0] * this.maxLeft + (this.tr[12] + shiftX) > this.screenLeft)
      shiftX = this.screenLeft - this.tr[0] * this.maxLeft - this.tr[12];
    if (this.tr[0] * this.maxRight + (this.tr[12] + shiftX) < this.screenRight)
      shiftX = this.screenRight - this.tr[0] * this.maxRight - this.tr[12];
    if (this.tr[5] * this.maxTop + (this.tr[13] + shiftY) < this.screenTop)
      shiftY = this.screenTop - this.tr[5] * this.maxTop - this.tr[13];
    if (
      this.tr[5] * this.maxBottom + (this.tr[13] + shiftY) >
      this.screenBottom
    )
      shiftY = this.screenBottom - this.tr[5] * this.maxBottom - this.tr[13];

    const tr1 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, shiftX, shiftY, 0, 1];
    L2DMatrix44.mul(tr1, this.tr, this.tr);
  }

  //============================================================
  //    L2DViewMatrix # adjustScale()
  //============================================================
  adjustScale(cx /*float*/, cy /*float*/, scale /*float*/) {
    const targetScale = scale * this.tr[0];
    if (targetScale < this.min) {
      if (this.tr[0] > 0) scale = this.min / this.tr[0];
    } else if (targetScale > this.max) {
      if (this.tr[0] > 0) scale = this.max / this.tr[0];
    }
    const tr1 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, cx, cy, 0, 1];
    const tr2 = [scale, 0, 0, 0, 0, scale, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    const tr3 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -cx, -cy, 0, 1];
    L2DMatrix44.mul(tr3, this.tr, this.tr);
    L2DMatrix44.mul(tr2, this.tr, this.tr);
    L2DMatrix44.mul(tr1, this.tr, this.tr);
  }

  //============================================================
  //    L2DViewMatrix # setScreenRect()
  //============================================================
  setScreenRect(
    left /*float*/,
    right /*float*/,
    bottom /*float*/,
    top /*float*/,
  ) {
    this.screenLeft = left;
    this.screenRight = right;
    this.screenTop = top;
    this.screenBottom = bottom;
  }

  //============================================================
  //    L2DViewMatrix # setMaxScreenRect()
  //============================================================
  setMaxScreenRect(
    left /*float*/,
    right /*float*/,
    bottom /*float*/,
    top /*float*/,
  ) {
    this.maxLeft = left;
    this.maxRight = right;
    this.maxTop = top;
    this.maxBottom = bottom;
  }

  //============================================================
  //    L2DViewMatrix # getScreenLeft()
  //============================================================
  getScreenLeft() {
    return this.screenLeft;
  }

  //============================================================
  //    L2DViewMatrix # getScreenRight()
  //============================================================
  getScreenRight() {
    return this.screenRight;
  }

  //============================================================
  //    L2DViewMatrix # getScreenBottom()
  //============================================================
  getScreenBottom() {
    return this.screenBottom;
  }

  //============================================================
  //    L2DViewMatrix # getScreenTop()
  //============================================================
  getScreenTop() {
    return this.screenTop;
  }

  //============================================================
  //    L2DViewMatrix # getMaxLeft()
  //============================================================
  getMaxLeft() {
    return this.maxLeft;
  }

  //============================================================
  //    L2DViewMatrix # getMaxRight()
  //============================================================
  getMaxRight() {
    return this.maxRight;
  }

  //============================================================
  //    L2DViewMatrix # getMaxBottom()
  //============================================================
  getMaxBottom() {
    return this.maxBottom;
  }

  //============================================================
  //    L2DViewMatrix # getMaxTop()
  //============================================================
  getMaxTop() {
    return this.maxTop;
  }
}

/**
 *
 *  You can modify and use this source freely
 *  only for the development of application related Live2D.
 *
 *  (c) Live2D Inc. All rights reserved.
 */

//============================================================
//============================================================
//  class Live2DFramework
//============================================================
//============================================================
class Live2DFramework {
  //============================================================
  //    static Live2DFramework.getPlatformManager()
  //============================================================
  static getPlatformManager() {
    return Live2DFramework.platformManager;
  }

  //============================================================
  //    static Live2DFramework.setPlatformManager()
  //============================================================
  static setPlatformManager(platformManager /*IPlatformManager*/) {
    Live2DFramework.platformManager = platformManager;
  }
}

//============================================================
Live2DFramework.platformManager = null;

export {
  L2DBaseModel,
  L2DViewMatrix,
  L2DEyeBlink,
  Live2DFramework,
  L2DMatrix44,
  L2DTargetPoint
}
