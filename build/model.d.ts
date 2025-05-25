import { LogLevel } from './logger.js';
interface ModelList {
    name: string;
    paths: string[];
    message: string;
}
interface Config {
    waifuPath: string;
    apiPath?: string;
    cdnPath?: string;
    cubism2Path?: string;
    cubism5Path?: string;
    modelId?: number;
    tools?: string[];
    drag?: boolean;
    logLevel?: LogLevel;
}
declare class ModelManager {
    readonly useCDN: boolean;
    private readonly cdnPath;
    private readonly cubism2Path;
    private readonly cubism5Path;
    private _modelId;
    private _modelTexturesId;
    private modelList;
    private cubism2model;
    private cubism5model;
    private currentModelVersion;
    private loading;
    private modelJSONCache;
    private models;
    private constructor();
    static initCheck(config: Config, models?: ModelList[]): Promise<ModelManager>;
    set modelId(modelId: number);
    get modelId(): number;
    set modelTexturesId(modelTexturesId: number);
    get modelTexturesId(): number;
    resetCanvas(): void;
    fetchWithCache(url: string): Promise<any>;
    checkModelVersion(modelSetting: any): 2 | 3;
    loadLive2D(modelSettingPath: string, modelSetting: object): Promise<void>;
    loadTextureCache(modelName: string): Promise<any[]>;
    loadModel(message: string | string[]): Promise<void>;
    loadRandTexture(successMessage?: string | string[], failMessage?: string | string[]): Promise<void>;
    loadNextModel(): Promise<void>;
}
export { ModelManager, Config, ModelList };
