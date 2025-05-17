import { LogLevel } from './logger.js';
interface ModelList {
    messages: string[];
    models: string | string[];
}
interface Config {
    waifuPath: string;
    apiPath?: string;
    cdnPath?: string;
    modelId?: number;
    tools?: string[];
    drag?: boolean;
    logLevel?: LogLevel;
}
declare class ModelManager {
    readonly useCDN: boolean;
    private readonly apiPath;
    private readonly cdnPath;
    private _modelId;
    private _modelTexturesId;
    private modelList;
    private readonly model;
    private modelInitialized;
    private modelJSONCache;
    constructor(config: Config);
    set modelId(modelId: number);
    get modelId(): number;
    set modelTexturesId(modelTexturesId: number);
    get modelTexturesId(): number;
    fetchWithCache(url: string): Promise<any>;
    loadLive2d(modelSettingPath: string, modelSetting: object): Promise<void>;
    loadModelList(): Promise<ModelList>;
    loadTextureCache(modelName: string): Promise<any[]>;
    loadModel(message: string): Promise<void>;
    loadRandTexture(): Promise<void>;
    loadNextModel(): Promise<void>;
}
export { ModelManager, Config };
