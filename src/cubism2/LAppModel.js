/* global UtSystem, document */
import { L2DBaseModel, Live2DFramework, L2DEyeBlink } from './Live2DFramework.js';
import ModelSettingJson from './utils/ModelSettingJson.js';
import LAppDefine from './LAppDefine.js';
import MatrixStack from './utils/MatrixStack.js';
import logger from '../logger.js';

//============================================================
//============================================================
//  class LAppModel     extends L2DBaseModel
//============================================================
//============================================================
class LAppModel extends L2DBaseModel {
  constructor() {
    //L2DBaseModel.apply(this, arguments);
    super();

    this.modelHomeDir = '';
    this.modelSetting = null;
    this.tmpMatrix = [];
  }

  loadJSON(callback) {
    const path = this.modelHomeDir + this.modelSetting.getModelFile();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.loadModelData(path, model => {
      for (let i = 0; i < this.modelSetting.getTextureNum(); i++) {
        const texPaths =
          this.modelHomeDir + this.modelSetting.getTextureFile(i);

        this.loadTexture(i, texPaths, () => {
          if (this.isTexLoaded) {
            if (this.modelSetting.getExpressionNum() > 0) {
              this.expressions = {};

              for (
                let j = 0;
                j < this.modelSetting.getExpressionNum();
                j++
              ) {
                const expName = this.modelSetting.getExpressionName(j);
                const expFilePath =
                  this.modelHomeDir +
                  this.modelSetting.getExpressionFile(j);

                this.loadExpression(expName, expFilePath);
              }
            } else {
              this.expressionManager = null;
              this.expressions = {};
            }

            if (this.eyeBlink == null) {
              this.eyeBlink = new L2DEyeBlink();
            }

            if (this.modelSetting.getPhysicsFile() != null) {
              this.loadPhysics(
                this.modelHomeDir + this.modelSetting.getPhysicsFile(),
              );
            } else {
              this.physics = null;
            }

            if (this.modelSetting.getPoseFile() != null) {
              this.loadPose(
                this.modelHomeDir + this.modelSetting.getPoseFile(),
                () => {
                  this.pose.updateParam(this.live2DModel);
                },
              );
            } else {
              this.pose = null;
            }

            if (this.modelSetting.getLayout() != null) {
              const layout = this.modelSetting.getLayout();
              if (layout['width'] != null)
                this.modelMatrix.setWidth(layout['width']);
              if (layout['height'] != null)
                this.modelMatrix.setHeight(layout['height']);

              if (layout['x'] != null) this.modelMatrix.setX(layout['x']);
              if (layout['y'] != null) this.modelMatrix.setY(layout['y']);
              if (layout['center_x'] != null)
                this.modelMatrix.centerX(layout['center_x']);
              if (layout['center_y'] != null)
                this.modelMatrix.centerY(layout['center_y']);
              if (layout['top'] != null)
                this.modelMatrix.top(layout['top']);
              if (layout['bottom'] != null)
                this.modelMatrix.bottom(layout['bottom']);
              if (layout['left'] != null)
                this.modelMatrix.left(layout['left']);
              if (layout['right'] != null)
                this.modelMatrix.right(layout['right']);
            }

            for (let j = 0; j < this.modelSetting.getInitParamNum(); j++) {
              this.live2DModel.setParamFloat(
                this.modelSetting.getInitParamID(j),
                this.modelSetting.getInitParamValue(j),
              );
            }

            for (
              let j = 0;
              j < this.modelSetting.getInitPartsVisibleNum();
              j++
            ) {
              this.live2DModel.setPartsOpacity(
                this.modelSetting.getInitPartsVisibleID(j),
                this.modelSetting.getInitPartsVisibleValue(j),
              );
            }

            this.live2DModel.saveParam();
            // this.live2DModel.setGL(gl);

            this.preloadMotionGroup(LAppDefine.MOTION_GROUP_IDLE);
            this.mainMotionManager.stopAllMotions();

            this.setUpdating(false);
            this.setInitialized(true);

            if (typeof callback == 'function') callback();
          }
        });
      }
    });
  }

  async loadModelSetting(modelSettingPath, modelSetting) {
    this.setUpdating(true);
    this.setInitialized(false);

    this.modelHomeDir = modelSettingPath.substring(
      0,
      modelSettingPath.lastIndexOf('/') + 1,
    );

    this.modelSetting = new ModelSettingJson();
    this.modelSetting.json = modelSetting;
    await new Promise(resolve => this.loadJSON(resolve));
  }

  load(gl, modelSettingPath, callback) {
    this.setUpdating(true);
    this.setInitialized(false);

    this.modelHomeDir = modelSettingPath.substring(
      0,
      modelSettingPath.lastIndexOf('/') + 1,
    );

    this.modelSetting = new ModelSettingJson();

    this.modelSetting.loadModelSetting(modelSettingPath, () => {
      this.loadJSON(callback);
    });
  }

  release(gl) {
    // this.live2DModel.deleteTextures();
    const pm = Live2DFramework.getPlatformManager();

    gl.deleteTexture(pm.texture);
  }

  preloadMotionGroup(name) {
    for (let i = 0; i < this.modelSetting.getMotionNum(name); i++) {
      const file = this.modelSetting.getMotionFile(name, i);
      this.loadMotion(file, this.modelHomeDir + file, motion => {
        motion.setFadeIn(this.modelSetting.getMotionFadeIn(name, i));
        motion.setFadeOut(this.modelSetting.getMotionFadeOut(name, i));
      });
    }
  }

  update() {
    // logger.trace("--> LAppModel.update()");

    if (this.live2DModel == null) {
      logger.error('Failed to update.');

      return;
    }

    const timeMSec = UtSystem.getUserTimeMSec() - this.startTimeMSec;
    const timeSec = timeMSec / 1000.0;
    const t = timeSec * 2 * Math.PI;

    if (this.mainMotionManager.isFinished()) {
      this.startRandomMotion(
        LAppDefine.MOTION_GROUP_IDLE,
        LAppDefine.PRIORITY_IDLE,
      );
    }

    //-----------------------------------------------------------------

    this.live2DModel.loadParam();

    const update = this.mainMotionManager.updateParam(this.live2DModel);
    if (!update) {
      if (this.eyeBlink != null) {
        this.eyeBlink.updateParam(this.live2DModel);
      }
    }

    this.live2DModel.saveParam();

    //-----------------------------------------------------------------

    if (
      this.expressionManager != null &&
      this.expressions != null &&
      !this.expressionManager.isFinished()
    ) {
      this.expressionManager.updateParam(this.live2DModel);
    }

    this.live2DModel.addToParamFloat('PARAM_ANGLE_X', this.dragX * 30, 1);
    this.live2DModel.addToParamFloat('PARAM_ANGLE_Y', this.dragY * 30, 1);
    this.live2DModel.addToParamFloat(
      'PARAM_ANGLE_Z',
      this.dragX * this.dragY * -30,
      1,
    );

    this.live2DModel.addToParamFloat('PARAM_BODY_ANGLE_X', this.dragX * 10, 1);

    this.live2DModel.addToParamFloat('PARAM_EYE_BALL_X', this.dragX, 1);
    this.live2DModel.addToParamFloat('PARAM_EYE_BALL_Y', this.dragY, 1);

    this.live2DModel.addToParamFloat(
      'PARAM_ANGLE_X',
      Number(15 * Math.sin(t / 6.5345)),
      0.5,
    );
    this.live2DModel.addToParamFloat(
      'PARAM_ANGLE_Y',
      Number(8 * Math.sin(t / 3.5345)),
      0.5,
    );
    this.live2DModel.addToParamFloat(
      'PARAM_ANGLE_Z',
      Number(10 * Math.sin(t / 5.5345)),
      0.5,
    );
    this.live2DModel.addToParamFloat(
      'PARAM_BODY_ANGLE_X',
      Number(4 * Math.sin(t / 15.5345)),
      0.5,
    );
    this.live2DModel.setParamFloat(
      'PARAM_BREATH',
      Number(0.5 + 0.5 * Math.sin(t / 3.2345)),
      1,
    );

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
  }

  setRandomExpression() {
    const tmp = [];
    for (const name in this.expressions) {
      tmp.push(name);
    }

    const no = parseInt(Math.random() * tmp.length);

    this.setExpression(tmp[no]);
  }

  startRandomMotion(name, priority) {
    const max = this.modelSetting.getMotionNum(name);
    const no = parseInt(Math.random() * max);
    this.startMotion(name, no, priority);
  }

  startMotion(name, no, priority) {
    // logger.trace("startMotion : " + name + " " + no + " " + priority);

    const motionName = this.modelSetting.getMotionFile(name, no);

    if (motionName == null || motionName == '') {
      return;
    }

    if (priority == LAppDefine.PRIORITY_FORCE) {
      this.mainMotionManager.setReservePriority(priority);
    } else if (!this.mainMotionManager.reserveMotion(priority)) {
      logger.trace('Motion is running.');
      return;
    }

    let motion;

    if (this.motions[name] == null) {
      this.loadMotion(null, this.modelHomeDir + motionName, mtn => {
        motion = mtn;

        this.setFadeInFadeOut(name, no, priority, motion);
      });
    } else {
      motion = this.motions[name];

      this.setFadeInFadeOut(name, no, priority, motion);
    }
  }

  setFadeInFadeOut(name, no, priority, motion) {
    const motionName = this.modelSetting.getMotionFile(name, no);

    motion.setFadeIn(this.modelSetting.getMotionFadeIn(name, no));
    motion.setFadeOut(this.modelSetting.getMotionFadeOut(name, no));

    logger.trace('Start motion : ' + motionName);

    if (this.modelSetting.getMotionSound(name, no) == null) {
      this.mainMotionManager.startMotionPrio(motion, priority);
    } else {
      const soundName = this.modelSetting.getMotionSound(name, no);
      // var player = new Sound(this.modelHomeDir + soundName);

      const snd = document.createElement('audio');
      snd.src = this.modelHomeDir + soundName;

      logger.trace('Start sound : ' + soundName);

      snd.play();
      this.mainMotionManager.startMotionPrio(motion, priority);
    }
  }

  setExpression(name) {
    const motion = this.expressions[name];

    logger.trace('Expression : ' + name);

    this.expressionManager?.startMotion(motion, false);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  draw(gl) {
    //logger.trace("--> LAppModel.draw()");

    // if(this.live2DModel == null) return;

    MatrixStack.push();

    MatrixStack.multMatrix(this.modelMatrix.getArray());

    this.tmpMatrix = MatrixStack.getMatrix();
    this.live2DModel.setMatrix(this.tmpMatrix);
    this.live2DModel.draw();

    MatrixStack.pop();
  }

  hitTest(id, testX, testY) {
    const len = this.modelSetting.getHitAreaNum();
    if (len == 0) {
      const hitAreasCustom = this.modelSetting.getHitAreaCustom();
      if (hitAreasCustom) {
        const x = hitAreasCustom[id + '_x'];
        const y = hitAreasCustom[id + '_y'];

        if (testX > Math.min(...x) && testX < Math.max(...x) &&
            testY > Math.min(...y) && testY < Math.max(...y)) {
          return true;
        }
      }
    }
    for (let i = 0; i < len; i++) {
      if (id == this.modelSetting.getHitAreaName(i)) {
        const drawID = this.modelSetting.getHitAreaID(i);

        return this.hitTestSimple(drawID, testX, testY);
      }
    }

    return false;
  }
}

export default LAppModel;
