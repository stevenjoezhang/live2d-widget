import { Live2DFramework } from '../Live2DFramework.js';

class ModelSettingJson {
  constructor() {
    this.NAME = 'name';
    this.ID = 'id';
    this.MODEL = 'model';
    this.TEXTURES = 'textures';
    this.HIT_AREAS = 'hit_areas';
    this.HIT_AREAS_CUSTOM = 'hit_areas_custom';
    this.PHYSICS = 'physics';
    this.POSE = 'pose';
    this.EXPRESSIONS = 'expressions';
    this.MOTION_GROUPS = 'motions';
    this.SOUND = 'sound';
    this.FADE_IN = 'fade_in';
    this.FADE_OUT = 'fade_out';
    this.LAYOUT = 'layout';
    this.INIT_PARAM = 'init_param';
    this.INIT_PARTS_VISIBLE = 'init_parts_visible';
    this.VALUE = 'val';
    this.FILE = 'file';

    this.json = {};
  }

  loadModelSetting(path, callback) {
    const pm = Live2DFramework.getPlatformManager();
    pm.loadBytes(path, buf => {
      const str = String.fromCharCode.apply(null, new Uint8Array(buf));
      this.json = JSON.parse(str);
      callback();
    });
  }

  getTextureFile(n) {
    if (this.json[this.TEXTURES] == null || this.json[this.TEXTURES][n] == null)
      return null;

    return this.json[this.TEXTURES][n];
  }

  getModelFile() {
    return this.json[this.MODEL];
  }

  getTextureNum() {
    if (this.json[this.TEXTURES] == null) return 0;

    return this.json[this.TEXTURES].length;
  }

  getHitAreaNum() {
    if (this.json[this.HIT_AREAS] == null) return 0;

    return this.json[this.HIT_AREAS].length;
  }

  getHitAreaCustom() {
    return this.json[this.HIT_AREAS_CUSTOM];
  }

  getHitAreaID(n) {
    if (
      this.json[this.HIT_AREAS] == null ||
      this.json[this.HIT_AREAS][n] == null
    )
      return null;

    return this.json[this.HIT_AREAS][n][this.ID];
  }

  getHitAreaName(n) {
    if (
      this.json[this.HIT_AREAS] == null ||
      this.json[this.HIT_AREAS][n] == null
    )
      return null;

    return this.json[this.HIT_AREAS][n][this.NAME];
  }

  getPhysicsFile() {
    return this.json[this.PHYSICS];
  }

  getPoseFile() {
    return this.json[this.POSE];
  }

  getExpressionNum() {
    return this.json[this.EXPRESSIONS] == null
      ? 0
      : this.json[this.EXPRESSIONS].length;
  }

  getExpressionFile(n) {
    if (this.json[this.EXPRESSIONS] == null) return null;
    return this.json[this.EXPRESSIONS][n][this.FILE];
  }

  getExpressionName(n) {
    if (this.json[this.EXPRESSIONS] == null) return null;
    return this.json[this.EXPRESSIONS][n][this.NAME];
  }

  getLayout() {
    return this.json[this.LAYOUT];
  }

  getInitParamNum() {
    return this.json[this.INIT_PARAM] == null
      ? 0
      : this.json[this.INIT_PARAM].length;
  }

  getMotionNum(name) {
    if (
      this.json[this.MOTION_GROUPS] == null ||
      this.json[this.MOTION_GROUPS][name] == null
    )
      return 0;

    return this.json[this.MOTION_GROUPS][name].length;
  }

  getMotionFile(name, n) {
    if (
      this.json[this.MOTION_GROUPS] == null ||
      this.json[this.MOTION_GROUPS][name] == null ||
      this.json[this.MOTION_GROUPS][name][n] == null
    )
      return null;

    return this.json[this.MOTION_GROUPS][name][n][this.FILE];
  }

  getMotionSound(name, n) {
    if (
      this.json[this.MOTION_GROUPS] == null ||
      this.json[this.MOTION_GROUPS][name] == null ||
      this.json[this.MOTION_GROUPS][name][n] == null ||
      this.json[this.MOTION_GROUPS][name][n][this.SOUND] == null
    )
      return null;

    return this.json[this.MOTION_GROUPS][name][n][this.SOUND];
  }

  getMotionFadeIn(name, n) {
    if (
      this.json[this.MOTION_GROUPS] == null ||
      this.json[this.MOTION_GROUPS][name] == null ||
      this.json[this.MOTION_GROUPS][name][n] == null ||
      this.json[this.MOTION_GROUPS][name][n][this.FADE_IN] == null
    )
      return 1000;

    return this.json[this.MOTION_GROUPS][name][n][this.FADE_IN];
  }

  getMotionFadeOut(name, n) {
    if (
      this.json[this.MOTION_GROUPS] == null ||
      this.json[this.MOTION_GROUPS][name] == null ||
      this.json[this.MOTION_GROUPS][name][n] == null ||
      this.json[this.MOTION_GROUPS][name][n][this.FADE_OUT] == null
    )
      return 1000;

    return this.json[this.MOTION_GROUPS][name][n][this.FADE_OUT];
  }

  getInitParamID(n) {
    if (
      this.json[this.INIT_PARAM] == null ||
      this.json[this.INIT_PARAM][n] == null
    )
      return null;

    return this.json[this.INIT_PARAM][n][this.ID];
  }

  getInitParamValue(n) {
    if (
      this.json[this.INIT_PARAM] == null ||
      this.json[this.INIT_PARAM][n] == null
    )
      return NaN;

    return this.json[this.INIT_PARAM][n][this.VALUE];
  }

  getInitPartsVisibleNum() {
    return this.json[this.INIT_PARTS_VISIBLE] == null
      ? 0
      : this.json[this.INIT_PARTS_VISIBLE].length;
  }

  getInitPartsVisibleID(n) {
    if (
      this.json[this.INIT_PARTS_VISIBLE] == null ||
      this.json[this.INIT_PARTS_VISIBLE][n] == null
    )
      return null;
    return this.json[this.INIT_PARTS_VISIBLE][n][this.ID];
  }

  getInitPartsVisibleValue(n) {
    if (
      this.json[this.INIT_PARTS_VISIBLE] == null ||
      this.json[this.INIT_PARTS_VISIBLE][n] == null
    )
      return NaN;

    return this.json[this.INIT_PARTS_VISIBLE][n][this.VALUE];
  }
}

export default ModelSettingJson;
