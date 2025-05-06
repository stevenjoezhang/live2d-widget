declare class Model {
    private readonly useCDN;
    private readonly apiPath;
    private readonly cdnPath;
    private modelList;
    constructor(config: {
        apiPath?: string;
        cdnPath?: string;
    });
    loadModelList(): Promise<void>;
    loadModel(modelId: number, modelTexturesId: number, message: string): Promise<void>;
    loadRandModel(): Promise<void>;
    loadOtherModel(): Promise<void>;
}
export default Model;
