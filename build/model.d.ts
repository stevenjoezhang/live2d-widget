import { LogLevel } from './logger.js';
interface ModelList {
    messages: string[];
    models: string | string[];
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
    private model;
    private modelInitialized;
    private modelJSONCache;
    constructor(config: Config);
    set modelId(modelId: number);
    get modelId(): number;
    set modelTexturesId(modelTexturesId: number);
    get modelTexturesId(): number;
    fetchWithCache(url: string): Promise<any>;
    checkModelVersion(modelSetting: any): 2 | 3;
    loadLive2d(modelSettingPath: string, modelSetting: object): Promise<void>;
    loadModelList(): Promise<ModelList>;
    loadTextureCache(modelName: string): Promise<any[]>;
    loadModel(message: string): Promise<void>;
    loadRandTexture(): Promise<void>;
    loadNextModel(): Promise<void>;
}
export { ModelManager, Config };
