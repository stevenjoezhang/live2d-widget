interface ModelList {
    messages: string[];
    models: string | string[];
}
declare class ModelManager {
    private readonly useCDN;
    private readonly apiPath;
    private readonly cdnPath;
    private modelList;
    private readonly model;
    private modelInitialized;
    constructor(config: {
        apiPath?: string;
        cdnPath?: string;
    });
    loadLive2d(modelSettingPath: string): Promise<void>;
    loadModelList(): Promise<ModelList>;
    loadModel(modelId: number, modelTexturesId: number, message: string): Promise<void>;
    loadRandModel(): Promise<void>;
    loadOtherModel(): Promise<void>;
}
export default ModelManager;
