/**
 * @file 包含看板娘模型加载和管理相关的类。
 * @module model
 */

import { showMessage } from './message.js';
import { randomSelection, loadExternalResource } from './utils.js';
import type Cubism2Model from './live2d/index.js';
import type { AppDelegate as Cubism5Model } from './cubism5/index.js';
import logger, { LogLevel } from './logger.js';

interface ModelList {
  messages: string[];
  models: string | string[];
}

interface Config {
  /**
   * 看板娘配置文件的路径。
   * @type {string}
   */
  waifuPath: string;
  /**
   * API 的路径，如果需要使用 API 加载模型。
   * @type {string | undefined}
   */
  apiPath?: string;
  /**
   * CDN 的路径，如果需要使用 CDN 加载模型。
   * @type {string | undefined}
   */
  cdnPath?: string;
  /**
   * Cubism 2 Core 的路径，如果需要加载 Cubism 2 模型。
   * @type {string | undefined}
   */
  cubism2Path?: string;
  /**
   * Cubism 5 Core 的路径，如果需要加载 Cubism 3 及之后的模型。
   * @type {string | undefined}
   */
  cubism5Path?: string;
  /**
   * 默认模型的 id。
   * @type {string | undefined}
   */
  modelId?: number;
  /**
   * 需要显示的工具列表。
   * @type {string[] | undefined}
   */
  tools?: string[];
  /**
   * 支持拖动看板娘。
   * @type {boolean | undefined}
   */
  drag?: boolean;
  /**
   * 日志的等级。
   * @type {LogLevel | undefined}
   */
  logLevel?: LogLevel;
}

/**
 * 看板娘模型类，负责加载和管理模型。
 */
class ModelManager {
  public readonly useCDN: boolean;
  private readonly cdnPath: string;
  private readonly cubism2Path: string;
  private readonly cubism5Path: string;
  private _modelId: number;
  private _modelTexturesId: number;
  private modelList: ModelList | null = null;
  private cubism2model: Cubism2Model | undefined;
  private cubism5model: Cubism5Model | undefined;
  private currentModelVersion: number;
  private modelJSONCache: Record<string, any>;

  /**
   * 创建一个 Model 实例。
   * @param {Object} config - 配置选项。
   * @param {string} [config.cdnPath] - CDN 路径。
   */
  constructor(config: Config) {
    let { apiPath, cdnPath } = config;
    const { cubism2Path, cubism5Path } = config;
    const useCDN = true;
    if (typeof cdnPath === 'string') {
      if (!cdnPath.endsWith('/')) cdnPath += '/';
    } else if (typeof apiPath === 'string') {
      if (!apiPath.endsWith('/')) apiPath += '/';
      cdnPath = apiPath;
      logger.warn('apiPath option is deprecated. Please use cdnPath instead.');
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
    this.cdnPath = cdnPath || '';
    this.cubism2Path = cubism2Path || '';
    this.cubism5Path = cubism5Path || '';
    this._modelId = modelId;
    this._modelTexturesId = modelTexturesId;
    this.currentModelVersion = 0;
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

  checkModelVersion(modelSetting: any) {
    if (modelSetting.Version === 3 || modelSetting.FileReferences) {
      return 3;
    }
    return 2;
  }

  async loadLive2D(modelSettingPath: string, modelSetting: object) {
    const version = this.checkModelVersion(modelSetting);
    if (version === 2) {
      if (!this.cubism2model) {
        if (!this.cubism2Path) {
          logger.error('No cubism2Path set, cannot load Cubism 2 Core.')
          return;
        }
        await loadExternalResource(this.cubism2Path, 'js');
        const { default: Cubism2Model } = await import('./live2d/index.js');
        this.cubism2model = new Cubism2Model();
      }
      if (!this.cubism2model.gl) {
        await this.cubism2model?.init('live2d', modelSettingPath, modelSetting);
      } else {
        await this.cubism2model?.changeModelWithJSON(modelSettingPath, modelSetting);
      }
    } else {
      if (!this.cubism5Path) {
        logger.error('No cubism5Path set, cannot load Cubism 5 Core.')
        return;
      }
      await loadExternalResource(this.cubism5Path, 'js');
      const { AppDelegate: Cubism5Model} = await import('./cubism5/index.js');
      this.cubism5model = new (Cubism5Model as any)();
      if (!this.cubism5model.subdelegates.at(0)) {
        this.cubism5model.initialize();
        this.cubism5model.changeModel(modelSettingPath);
        this.cubism5model.run();
      } else {
        this.cubism5model.changeModel(modelSettingPath);
      }
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
      await this.loadLive2D(modelSettingPath, modelSetting);
    }
    showMessage(message, 4000, 10);
  }

  /**
   * 加载随机材质的模型。
   */
  async loadRandTexture() {
    const { modelId } = this;
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
      await this.loadLive2D(modelSettingPath, modelSetting);
      showMessage('我的新衣服好看嘛？', 4000, 10);
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
    }
  }
}

export { ModelManager, Config };
