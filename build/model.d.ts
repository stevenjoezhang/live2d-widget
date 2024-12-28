/**
 * @file 包含看板娘模型加载和管理相关的类。
 * @module model
 */
/**
 * 看板娘模型类，负责加载和管理模型。
 */
declare class Model {
    private readonly useCDN;
    private readonly apiPath;
    private readonly cdnPath;
    private modelList;
    /**
     * 创建一个 Model 实例。
     * @param {Object} config - 配置选项。
     * @param {string} [config.apiPath] - API 路径。
     * @param {string} [config.cdnPath] - CDN 路径。
     */
    constructor(config: {
        apiPath?: string;
        cdnPath?: string;
    });
    /**
     * 加载模型列表。
     */
    loadModelList(): Promise<void>;
    /**
     * 加载指定模型。
     * @param {number} modelId - 模型 ID。
     * @param {number} modelTexturesId - 模型材质 ID。
     * @param {string} message - 加载消息。
     */
    loadModel(modelId: number, modelTexturesId: number, message: string): Promise<void>;
    /**
     * 加载随机材质的模型。
     */
    loadRandModel(): Promise<void>;
    /**
     * 加载其他模型。
     */
    loadOtherModel(): Promise<void>;
}
export default Model;
