/* global console, Live2D */
import { Live2DFramework } from './Live2DFramework';
import LAppModel from './LAppModel';
import PlatformManager from './PlatformManager';
import LAppDefine from './LAppDefine';

class LAppLive2DManager {
  constructor() {
    // console.log("--> LAppLive2DManager()");

    this.models = [];

    this.reloadFlg = false;

    Live2D.init();
    Live2DFramework.setPlatformManager(new PlatformManager());
  }

  createModel() {
    const model = new LAppModel();
    this.models.push(model);

    return model;
  }

  changeModel(gl, modelSettingPath) {
    // console.log("--> LAppLive2DManager.update(gl)");

    if (this.reloadFlg) {
      this.reloadFlg = false;

      this.releaseModel(0, gl);
      this.createModel();
      this.models[0].load(gl, modelSettingPath);
    }
  }

  getModel(no) {
    // console.log("--> LAppLive2DManager.getModel(" + no + ")");

    if (no >= this.models.length) return null;

    return this.models[no];
  }

  releaseModel(no, gl) {
    // console.log("--> LAppLive2DManager.releaseModel(" + no + ")");

    if (this.models.length <= no) return;

    this.models[no].release(gl);

    delete this.models[no];
    this.models.splice(no, 1);
  }

  numModels() {
    return this.models.length;
  }

  setDrag(x, y) {
    for (let i = 0; i < this.models.length; i++) {
      this.models[i].setDrag(x, y);
    }
  }

  maxScaleEvent() {
    if (LAppDefine.DEBUG_LOG) console.log('Max scale event.');
    for (let i = 0; i < this.models.length; i++) {
      this.models[i].startRandomMotion(
        LAppDefine.MOTION_GROUP_PINCH_IN,
        LAppDefine.PRIORITY_NORMAL,
      );
    }
  }

  minScaleEvent() {
    if (LAppDefine.DEBUG_LOG) console.log('Min scale event.');
    for (let i = 0; i < this.models.length; i++) {
      this.models[i].startRandomMotion(
        LAppDefine.MOTION_GROUP_PINCH_OUT,
        LAppDefine.PRIORITY_NORMAL,
      );
    }
  }

  tapEvent(x, y) {
    if (LAppDefine.DEBUG_LOG) console.log('tapEvent view x:' + x + ' y:' + y);

    for (let i = 0; i < this.models.length; i++) {
      if (this.models[i].hitTest(LAppDefine.HIT_AREA_HEAD, x, y)) {
        if (LAppDefine.DEBUG_LOG) console.log('Tap face.');

        this.models[i].setRandomExpression();
      } else if (this.models[i].hitTest(LAppDefine.HIT_AREA_BODY, x, y)) {
        if (LAppDefine.DEBUG_LOG)
          console.log('Tap body.' + ' models[' + i + ']');

        this.models[i].startRandomMotion(
          LAppDefine.MOTION_GROUP_TAP_BODY,
          LAppDefine.PRIORITY_NORMAL,
        );
      }
    }

    return true;
  }
}

export default LAppLive2DManager;
