export default LAppLive2DManager;
declare class LAppLive2DManager {
    model: LAppModel;
    reloading: boolean;
    getModel(): LAppModel;
    releaseModel(gl: any): void;
    changeModel(gl: any, modelSettingPath: any): Promise<any>;
    changeModelWithJSON(gl: any, modelSettingPath: any, modelSetting: any): Promise<void>;
    setDrag(x: any, y: any): void;
    maxScaleEvent(): void;
    minScaleEvent(): void;
    tapEvent(x: any, y: any): boolean;
}
import LAppModel from './LAppModel.js';
