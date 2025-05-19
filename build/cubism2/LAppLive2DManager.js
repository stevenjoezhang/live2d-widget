var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Live2DFramework } from './Live2DFramework.js';
import LAppModel from './LAppModel.js';
import PlatformManager from './PlatformManager.js';
import LAppDefine from './LAppDefine.js';
import logger from '../logger.js';
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
    changeModel(gl, modelSettingPath) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (this.reloading)
                    return;
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
            });
        });
    }
    changeModelWithJSON(gl, modelSettingPath, modelSetting) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.reloading)
                return;
            this.reloading = true;
            const oldModel = this.model;
            const newModel = new LAppModel();
            yield newModel.loadModelSetting(modelSettingPath, modelSetting);
            if (oldModel) {
                oldModel.release(gl);
            }
            this.model = newModel;
            this.reloading = false;
        });
    }
    setDrag(x, y) {
        if (this.model) {
            this.model.setDrag(x, y);
        }
    }
    maxScaleEvent() {
        logger.trace('Max scale event.');
        if (this.model) {
            this.model.startRandomMotion(LAppDefine.MOTION_GROUP_PINCH_IN, LAppDefine.PRIORITY_NORMAL);
        }
    }
    minScaleEvent() {
        logger.trace('Min scale event.');
        if (this.model) {
            this.model.startRandomMotion(LAppDefine.MOTION_GROUP_PINCH_OUT, LAppDefine.PRIORITY_NORMAL);
        }
    }
    tapEvent(x, y) {
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
    }
}
export default LAppLive2DManager;
