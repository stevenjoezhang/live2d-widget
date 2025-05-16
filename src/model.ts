/**
 * @file 包含看板娘模型加载和管理相关的类。
 * @module model
 */

import showMessage from './message.js';
import randomSelection from './utils.js';
import Model from './live2d/index.js';

interface ModelList {
  messages: string[];
  models: string | string[];
}

/**
 * 看板娘模型类，负责加载和管理模型。
 */
class ModelManager {
  private readonly useCDN: boolean;
  private readonly apiPath: string;
  private readonly cdnPath: string;
  private modelList: ModelList | null = null;
  private readonly model: Model;
  private modelInitialized: boolean;

  /**
   * 创建一个 Model 实例。
   * @param {Object} config - 配置选项。
   * @param {string} [config.apiPath] - API 路径。
   * @param {string} [config.cdnPath] - CDN 路径。
   */
  constructor(config: { apiPath?: string; cdnPath?: string }) {
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
    this.useCDN = useCDN;
    this.apiPath = apiPath || '';
    this.cdnPath = cdnPath || '';
    this.model = new Model();
    this.modelInitialized = false;
  }

  async loadLive2d(modelSettingPath: string) {
    if (!this.modelInitialized) {
      this.modelInitialized = true;
      await this.model.init('live2d', modelSettingPath);
    } else {
      await this.model.changeModel(modelSettingPath);
    }
    console.log(`Live2D Model ${modelSettingPath} Loaded`);
  }

  /**
   * 加载模型列表。
   */
  async loadModelList(): Promise<ModelList> {
    const response = await fetch(`${this.cdnPath}model_list.json`);
    const modelList = await response.json();
    return modelList;
  }

  /**
   * 加载指定模型。
   * @param {number} modelId - 模型 ID。
   * @param {number} modelTexturesId - 模型材质 ID。
   * @param {string} message - 加载消息。
   */
  async loadModel(modelId: number, modelTexturesId: number, message: string) {
    localStorage.setItem('modelId', modelId.toString());
    localStorage.setItem('modelTexturesId', modelTexturesId.toString());
    if (this.useCDN) {
      if (!this.modelList) {
        this.modelList = await this.loadModelList();
      }
      const target = randomSelection(this.modelList.models[modelId]);
      await this.loadLive2d(`${this.cdnPath}model/${target}/index.json`);
    } else {
      await this.loadLive2d(`${this.apiPath}get/?id=${modelId}-${modelTexturesId}`);
    }
    showMessage(message, 4000, 10);
  }

  /**
   * 加载随机材质的模型。
   */
  async loadRandModel() {
    const modelId = Number(localStorage.getItem('modelId'));
    const modelTexturesId = Number(localStorage.getItem('modelTexturesId'));
    if (this.useCDN && modelId) {
      if (!this.modelList) {
        this.modelList = await this.loadModelList();
      }
      const target = randomSelection(this.modelList.models[modelId]);
      await this.loadLive2d(`${this.cdnPath}model/${target}/index.json`);
      showMessage('我的新衣服好看嘛？', 4000, 10);
    } else {
      // Optional 'rand' (Random), 'switch' (Switch by order)
      fetch(`${this.apiPath}rand_textures/?id=${modelId}-${modelTexturesId}`)
        .then((response) => response.json())
        .then(async (result) => {
          if (
            result.textures.id === 1 &&
            (modelTexturesId === 1 || modelTexturesId === 0)
          ) {
            showMessage('我还没有其他衣服呢！', 4000, 10);
          } else if (modelId) {
            await this.loadModel(modelId, result.textures.id, '我的新衣服好看嘛？');
          }
        });
    }
  }

  /**
   * 加载其他模型。
   */
  async loadOtherModel() {
    let modelId = Number(localStorage.getItem('modelId'));
    if (this.useCDN && modelId) {
      if (!this.modelList) {
        this.modelList = await this.loadModelList();
      }
      const index = ++modelId >= this.modelList.models.length ? 0 : modelId;
      await this.loadModel(index, 0, this.modelList.messages[index]);
    } else {
      fetch(`${this.apiPath}switch/?id=${modelId}`)
        .then((response) => response.json())
        .then(async (result) => {
          await this.loadModel(result.model.id, 0, result.model.message);
        });
    }
  }
}

export default ModelManager;
