/**
 * @file 包含看板娘模型加载和管理相关的类。
 * @module model
 */

import { showMessage } from './message.js';
import { randomSelection } from './utils.js';
import Model from './live2d/index.js';
import logger from './logger.js';

interface ModelList {
  messages: string[];
  models: string | string[];
}

/**
 * 看板娘模型类，负责加载和管理模型。
 */
class ModelManager {
  public readonly useCDN: boolean;
  private readonly apiPath: string;
  private readonly cdnPath: string;
  private _modelId: number;
  private _modelTexturesId: number;
  private modelList: ModelList | null = null;
  private readonly model: Model;
  private modelInitialized: boolean;
  private modelJSONCache: Record<string, any>;

  /**
   * 创建一个 Model 实例。
   * @param {Object} config - 配置选项。
   * @param {string} [config.apiPath] - API 路径。
   * @param {string} [config.cdnPath] - CDN 路径。
   */
  constructor(config: Config) {
    let { apiPath, cdnPath } = config;
    let useCDN = false;
    if (typeof cdnPath === 'string') {
      useCDN = true;
      if (!cdnPath.endsWith('/')) cdnPath += '/';
    } else if (typeof apiPath === 'string') {
      if (!apiPath.endsWith('/')) apiPath += '/';
    } else {
      throw 'Invalid initWidget argument!';
    }
    let modelId: number = parseInt(localStorage.getItem('modelId') as string, 10);
    let modelTexturesId: number = parseInt(
      localStorage.getItem('modelTexturesId') as string, 10
    );
    if (isNaN(modelId) || isNaN(modelTexturesId)) {
      modelTexturesId = 0;
    }
    if (isNaN(modelId)) {
      modelId = config.modelId ?? (useCDN ? 0 : 1);
    }
    this.useCDN = useCDN;
    this.apiPath = apiPath || '';
    this.cdnPath = cdnPath || '';
    this._modelId = modelId;
    this._modelTexturesId = modelTexturesId;
    this.model = new Model();
    this.modelInitialized = false;
    this.modelJSONCache = {};
  }

  public set modelId(modelId: number) {
    this._modelId = modelId;
    localStorage.setItem('modelId', modelId.toString());
  }

  public get modelId() {
    return this._modelId;
  }

  public set modelTexturesId(modelTexturesId: number) {
    this._modelTexturesId = modelTexturesId;
    localStorage.setItem('modelTexturesId', modelTexturesId.toString());
  }

  public get modelTexturesId() {
    return this._modelTexturesId;
  }

  async fetchWithCache(url: string) {
    let result;
    if (url in this.modelJSONCache) {
      result = this.modelJSONCache[url];
    } else {
      const response = await fetch(url);
      result = await response.json();
      this.modelJSONCache[url] = result;
    }
    return result;
  }

  async loadLive2d(modelSettingPath: string, modelSetting: object) {
    if (!this.modelInitialized) {
      this.modelInitialized = true;
      await this.model.init('live2d', modelSettingPath, modelSetting);
    } else {
      await this.model.changeModelWithJSON(modelSettingPath, modelSetting);
    }
    logger.info(`Model ${modelSettingPath} loaded`);
  }

  /**
   * 加载模型列表。
   */
  async loadModelList(): Promise<ModelList> {
    const response = await fetch(`${this.cdnPath}model_list.json`);
    const modelList = await response.json();
    return modelList;
  }

  async loadTextureCache(modelName: string): Promise<any[]> {
    const textureCache = await this.fetchWithCache(`${this.cdnPath}model/${modelName}/textures.cache`);
    return textureCache;
  }

  /**
   * 加载指定模型。
   * @param {number} modelId - 模型 ID。
   * @param {number} modelTexturesId - 模型材质 ID。
   * @param {string} message - 加载消息。
   */
  async loadModel(message: string) {
    const { modelId, modelTexturesId } = this;
    if (this.useCDN) {
      if (!this.modelList) {
        this.modelList = await this.loadModelList();
      }
      const modelName = randomSelection(this.modelList.models[modelId]);
      const modelSettingPath = `${this.cdnPath}model/${modelName}/index.json`;
      const textureCache = await this.loadTextureCache(modelName);
      const modelSetting = await this.fetchWithCache(modelSettingPath);
      let textures = textureCache[modelTexturesId];
      if (typeof textures === 'string') textures = [textures];
      modelSetting.textures = textures;
      await this.loadLive2d(modelSettingPath, modelSetting);
    } else {
      const modelSettingPath = `${this.apiPath}get/?id=${modelId}-${modelTexturesId}`;
      const modelSetting = await this.fetchWithCache(modelSettingPath);
      await this.loadLive2d(modelSettingPath, modelSetting);
    }
    showMessage(message, 4000, 10);
  }

  /**
   * 加载随机材质的模型。
   */
  async loadRandTexture() {
    const { modelId, modelTexturesId } = this;
    if (this.useCDN) {
      if (!this.modelList) {
        this.modelList = await this.loadModelList();
      }
      const modelName = randomSelection(this.modelList.models[modelId]);
      const modelSettingPath = `${this.cdnPath}model/${modelName}/index.json`;
      const textureCache = await this.loadTextureCache(modelName);
      const modelSetting = await this.fetchWithCache(modelSettingPath);
      this.modelTexturesId = Math.floor(Math.random() * textureCache.length);
      let textures = textureCache[this.modelTexturesId];
      if (typeof textures === 'string') textures = [textures];
      modelSetting.textures = textures;
      await this.loadLive2d(modelSettingPath, modelSetting);
      showMessage('我的新衣服好看嘛？', 4000, 10);
    } else {
      // Optional 'rand' (Random), 'switch' (Switch by order)
      const response = await fetch(`${this.apiPath}rand_textures/?id=${modelId}-${modelTexturesId}`);
      const result = await response.json();
      if (
        result.textures.id === 1 &&
        (modelTexturesId === 1 || modelTexturesId === 0)
      ) {
        showMessage('我还没有其他衣服呢！', 4000, 10);
      } else {
        this.modelTexturesId = result.textures.id;
        await this.loadModel('我的新衣服好看嘛？');
      }
    }
  }

  /**
   * 加载其他模型。
   */
  async loadNextModel() {
    let { modelId } = this;
    this.modelTexturesId = 0;
    if (this.useCDN) {
      if (!this.modelList) {
        this.modelList = await this.loadModelList();
      }
      const index = ++modelId >= this.modelList.models.length ? 0 : modelId;
      this.modelId = index;
      await this.loadModel(this.modelList.messages[index]);
    } else {
      const response = await fetch(`${this.apiPath}switch/?id=${modelId}`);
      const result = await response.json();
      this.modelId = result.model.id;
      await this.loadModel(result.model.message);
    }
  }
}

export default ModelManager;
