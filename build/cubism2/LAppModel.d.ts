export default LAppModel;
declare class LAppModel extends L2DBaseModel {
    modelHomeDir: string;
    modelSetting: ModelSettingJson;
    tmpMatrix: any[];
    loadJSON(callback: any): void;
    loadModelSetting(modelSettingPath: any, modelSetting: any): Promise<void>;
    load(gl: any, modelSettingPath: any, callback: any): void;
    release(gl: any): void;
    preloadMotionGroup(name: any): void;
    update(): void;
    setRandomExpression(): void;
    startRandomMotion(name: any, priority: any): void;
    startMotion(name: any, no: any, priority: any): void;
    setFadeInFadeOut(name: any, no: any, priority: any, motion: any): void;
    setExpression(name: any): void;
    draw(gl: any): void;
    hitTest(id: any, testX: any, testY: any): boolean;
}
import { L2DBaseModel } from './Live2DFramework.js';
import ModelSettingJson from './utils/ModelSettingJson.js';
