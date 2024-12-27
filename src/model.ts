import showMessage from './message.js';
import randomSelection from './utils.js';

interface ModelList {
  messages: string[];
  models: string | string[];
}

class Model {
  private readonly useCDN: boolean;
  private readonly apiPath: string;
  private readonly cdnPath: string;
  private modelList: ModelList | null = null;

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
  }

  async loadModelList() {
    const response = await fetch(`${this.cdnPath}model_list.json`);
    this.modelList = await response.json();
  }

  async loadModel(modelId: number, modelTexturesId: number, message: string) {
    localStorage.setItem('modelId', modelId.toString());
    localStorage.setItem('modelTexturesId', modelTexturesId.toString());
    showMessage(message, 4000, 10);
    if (this.useCDN && this.modelList) {
      if (!this.modelList) await this.loadModelList();
      const target = randomSelection(this.modelList.models[modelId]);
      loadlive2d('live2d', `${this.cdnPath}model/${target}/index.json`);
    } else {
      loadlive2d(
        'live2d',
        `${this.apiPath}get/?id=${modelId}-${modelTexturesId}`,
      );
      console.log(`Live2D Model ${modelId}-${modelTexturesId} Loaded`);
    }
  }

  async loadRandModel() {
    const modelId = Number(localStorage.getItem('modelId'));
    const modelTexturesId = Number(localStorage.getItem('modelTexturesId'));
    if (this.useCDN && modelId && this.modelList) {
      if (!this.modelList) {
        await this.loadModelList();
      }
      const target = randomSelection(this.modelList.models[modelId]);
      loadlive2d('live2d', `${this.cdnPath}model/${target}/index.json`);
      showMessage('我的新衣服好看嘛？', 4000, 10);
    } else {
      // Optional "rand" (Random), "switch" (Switch by order)
      fetch(`${this.apiPath}rand_textures/?id=${modelId}-${modelTexturesId}`)
        .then((response) => response.json())
        .then((result) => {
          if (
            result.textures.id === 1 &&
            (modelTexturesId === 1 || modelTexturesId === 0)
          ) {
            showMessage('我还没有其他衣服呢！', 4000, 10);
          } else if (modelId) {
            this.loadModel(modelId, result.textures.id, '我的新衣服好看嘛？');
          }
        });
    }
  }

  async loadOtherModel() {
    let modelId = Number(localStorage.getItem('modelId'));
    if (this.useCDN && modelId && this.modelList) {
      if (!this.modelList) await this.loadModelList();
      const index = ++modelId >= this.modelList.models.length ? 0 : modelId;
      void this.loadModel(index, 0, this.modelList.messages[index]);
    } else {
      fetch(`${this.apiPath}switch/?id=${modelId}`)
        .then((response) => response.json())
        .then((result) => {
          this.loadModel(result.model.id, 0, result.model.message);
        });
    }
  }
}

export default Model;
