import showMessage from "./message.js";
import randomSelection, { loadJsonFile } from "./utils.js";

class LocalModel {
  constructor(config) {
    // modelListPath: 模型列表 json 文件路径(可不填，就是约定 modelsPath 下的 model_list.json)；modelsPath：模型的跟路径
    const { modelListPath, modelsPath } = config;

    if (!modelsPath) {
      throw "LocalModel requires modelListPath and modelsPath!";
    }
    const safeModelsPath = modelsPath.endsWith("/") ? modelsPath : modelsPath + "/";
    // 确保路径以 / 结尾
    this.modelsPath = safeModelsPath;
    this.modelListPath = modelListPath ?? safeModelsPath + "model_list.json";
  }

  async loadModelList() {
    try {
      this.modelList = await loadJsonFile(this.modelListPath);
      if (!this.modelList.models || !this.modelList.messages) {
        throw "Invalid model list format!";
      }
    } catch (error) {
      console.error("Failed to load model list:", error);
      throw "Failed to load model list!";
    }
  }

  async loadModel(modelId, modelTexturesId, message) {
    // 保存当前模型状态
    localStorage.setItem("modelId", modelId);
    localStorage.setItem("modelTexturesId", modelTexturesId);

    // 显示消息
    showMessage(message, 4000, 10);

    // 确保模型列表已加载
    if (!this.modelList) {
      await this.loadModelList();
    }
    // 获取目标模型，可能是值，也可能是数组
    const target = randomSelection(this.modelList.models[modelId]);
    // 加载模型
    loadlive2d("live2d", `${this.modelsPath}${target}/index.json`);
    console.log(`Live2D 模型 ${target} 加载完成`);
  }

  async loadRandModel() {
    const modelId = localStorage.getItem("modelId");
    let modelTexturesId = localStorage.getItem("modelTexturesId");

    if (!this.modelList) {
      await this.loadModelList();
    }

    const currentModel = this.modelList.models[modelId];

    if (Array.isArray(currentModel)) {
      // 对于数组类型的模型，随机选择一个不同的贴图
      let newTextureId;
      do {
        newTextureId = Math.floor(Math.random() * currentModel.length);
      } while (newTextureId === parseInt(modelTexturesId) && currentModel.length > 1);

      if (newTextureId === parseInt(modelTexturesId)) {
        showMessage("我还没有其他衣服呢！", 4000, 10);
        return;
      }

      this.loadModel(modelId, newTextureId, "我的新衣服好看嘛？");
    } else {
      showMessage("我还没有其他衣服呢！", 4000, 10);
    }
  }

  async loadOtherModel() {
    let modelId = parseInt(localStorage.getItem("modelId"));

    if (!this.modelList) {
      await this.loadModelList();
    }

    // 切换到下一个模型，如果到达末尾则回到开始
    const index = ++modelId >= this.modelList.models.length ? 0 : modelId;
    this.loadModel(index, 0, this.modelList.messages[index]);
  }
}

export default LocalModel;
