/* global console, Live2D */
import { Live2DFramework } from './Live2DFramework';
import LAppModel from './LAppModel';
import PlatformManager from './PlatformManager';
import LAppDefine from './LAppDefine';

class LAppLive2DManager {
  constructor() {
    this.model = null;
    this.reloading = false;

    Live2D.init();
    Live2DFramework.setPlatformManager(new PlatformManager());
  }

  getModel() {
    return this.model;
  }

  releaseModel(gl) {
    if (this.model) {
      this.model.release(gl);
      this.model = null;
    }
  }

  async changeModel(gl, modelSettingPath) {
    return new Promise((resolve, reject) => {
      if (this.reloading) return;
      this.reloading = true;

      const oldModel = this.model;
      const newModel = new LAppModel();

      newModel.load(gl, modelSettingPath, () => {
        if (oldModel) {
          oldModel.release(gl);
        }
        this.model = newModel;
        this.reloading = false;
        resolve();
      });
    })
  }

  setDrag(x, y) {
    if (this.model) {
      this.model.setDrag(x, y);
    }
  }

  maxScaleEvent() {
    if (LAppDefine.DEBUG_LOG) console.log('Max scale event.');
    if (this.model) {
      this.model.startRandomMotion(
        LAppDefine.MOTION_GROUP_PINCH_IN,
        LAppDefine.PRIORITY_NORMAL,
      );
    }
  }

  minScaleEvent() {
    if (LAppDefine.DEBUG_LOG) console.log('Min scale event.');
    if (this.model) {
      this.model.startRandomMotion(
        LAppDefine.MOTION_GROUP_PINCH_OUT,
        LAppDefine.PRIORITY_NORMAL,
      );
    }
  }

  tapEvent(x, y) {
    if (LAppDefine.DEBUG_LOG) console.log('tapEvent view x:' + x + ' y:' + y);

    if (!this.model) return false;

    if (this.model.hitTest(LAppDefine.HIT_AREA_HEAD, x, y)) {
      if (LAppDefine.DEBUG_LOG) console.log('Tap face.');
      this.model.setRandomExpression();
    } else if (this.model.hitTest(LAppDefine.HIT_AREA_BODY, x, y)) {
      if (LAppDefine.DEBUG_LOG) console.log('Tap body.');
      this.model.startRandomMotion(
        LAppDefine.MOTION_GROUP_TAP_BODY,
        LAppDefine.PRIORITY_NORMAL,
      );
    }
    return true;
  }
}

export default LAppLive2DManager;
