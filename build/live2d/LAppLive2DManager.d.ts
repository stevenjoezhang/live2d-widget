export default LAppLive2DManager;
declare class LAppLive2DManager {
    model: LAppModel | null;
    reloading: boolean;
    getModel(): LAppModel | null;
    releaseModel(gl: any): void;
    changeModel(gl: any, modelSettingPath: any): Promise<any>;
    setDrag(x: any, y: any): void;
    maxScaleEvent(): void;
    minScaleEvent(): void;
    tapEvent(x: any, y: any): boolean;
}
import LAppModel from './LAppModel';
