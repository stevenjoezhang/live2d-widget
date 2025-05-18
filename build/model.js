var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { showMessage } from './message.js';
import { randomSelection } from './utils.js';
import logger from './logger.js';
class ModelManager {
    constructor(config) {
        var _a;
        this.modelList = null;
        let { apiPath, cdnPath } = config;
        const { cubism2Path, cubism5Path } = config;
        const useCDN = true;
        if (typeof cdnPath === 'string') {
            if (!cdnPath.endsWith('/'))
                cdnPath += '/';
        }
        else if (typeof apiPath === 'string') {
            if (!apiPath.endsWith('/'))
                apiPath += '/';
            cdnPath = apiPath;
            logger.warn('apiPath option is deprecated. Please use cdnPath instead.');
        }
        else {
            throw 'Invalid initWidget argument!';
        }
        let modelId = parseInt(localStorage.getItem('modelId'), 10);
        let modelTexturesId = parseInt(localStorage.getItem('modelTexturesId'), 10);
        if (isNaN(modelId) || isNaN(modelTexturesId)) {
            modelTexturesId = 0;
        }
        if (isNaN(modelId)) {
            modelId = (_a = config.modelId) !== null && _a !== void 0 ? _a : (useCDN ? 0 : 1);
        }
        this.useCDN = useCDN;
        this.cdnPath = cdnPath || '';
        this.cubism2Path = cubism2Path || '';
        this.cubism5Path = cubism5Path || '';
        this._modelId = modelId;
        this._modelTexturesId = modelTexturesId;
        this.modelInitialized = false;
        this.modelJSONCache = {};
    }
    set modelId(modelId) {
        this._modelId = modelId;
        localStorage.setItem('modelId', modelId.toString());
    }
    get modelId() {
        return this._modelId;
    }
    set modelTexturesId(modelTexturesId) {
        this._modelTexturesId = modelTexturesId;
        localStorage.setItem('modelTexturesId', modelTexturesId.toString());
    }
    get modelTexturesId() {
        return this._modelTexturesId;
    }
    fetchWithCache(url) {
        return __awaiter(this, void 0, void 0, function* () {
            let result;
            if (url in this.modelJSONCache) {
                result = this.modelJSONCache[url];
            }
            else {
                const response = yield fetch(url);
                result = yield response.json();
                this.modelJSONCache[url] = result;
            }
            return result;
        });
    }
    checkModelVersion(modelSetting) {
        if (modelSetting.Version === 3 || modelSetting.FileReferences) {
            return 3;
        }
        return 2;
    }
    loadLive2d(modelSettingPath, modelSetting) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const version = this.checkModelVersion(modelSetting);
            if (version === 2) {
                if (!this.model) {
                    if (!this.cubism2Path) {
                        logger.error('No cubism2Path set, cannot load Cubism 2 Core.');
                        return;
                    }
                    yield import(this.cubism2Path);
                    const Model = yield import('./live2d/index.js');
                    this.model = new Model.default();
                }
            }
            else {
                if (!this.cubism5Path) {
                    logger.error('No cubism5Path set, cannot load Cubism 5 Core.');
                    return;
                }
                logger.error('Models version of Cubism 3 and later are not supported.');
                return;
            }
            if (!this.modelInitialized) {
                this.modelInitialized = true;
                yield ((_a = this.model) === null || _a === void 0 ? void 0 : _a.init('live2d', modelSettingPath, modelSetting));
            }
            else {
                yield ((_b = this.model) === null || _b === void 0 ? void 0 : _b.changeModelWithJSON(modelSettingPath, modelSetting));
            }
            logger.info(`Model ${modelSettingPath} loaded`);
        });
    }
    loadModelList() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(`${this.cdnPath}model_list.json`);
            const modelList = yield response.json();
            return modelList;
        });
    }
    loadTextureCache(modelName) {
        return __awaiter(this, void 0, void 0, function* () {
            const textureCache = yield this.fetchWithCache(`${this.cdnPath}model/${modelName}/textures.cache`);
            return textureCache;
        });
    }
    loadModel(message) {
        return __awaiter(this, void 0, void 0, function* () {
            const { modelId, modelTexturesId } = this;
            if (this.useCDN) {
                if (!this.modelList) {
                    this.modelList = yield this.loadModelList();
                }
                const modelName = randomSelection(this.modelList.models[modelId]);
                const modelSettingPath = `${this.cdnPath}model/${modelName}/index.json`;
                const textureCache = yield this.loadTextureCache(modelName);
                const modelSetting = yield this.fetchWithCache(modelSettingPath);
                let textures = textureCache[modelTexturesId];
                if (typeof textures === 'string')
                    textures = [textures];
                modelSetting.textures = textures;
                yield this.loadLive2d(modelSettingPath, modelSetting);
            }
            showMessage(message, 4000, 10);
        });
    }
    loadRandTexture() {
        return __awaiter(this, void 0, void 0, function* () {
            const { modelId } = this;
            if (this.useCDN) {
                if (!this.modelList) {
                    this.modelList = yield this.loadModelList();
                }
                const modelName = randomSelection(this.modelList.models[modelId]);
                const modelSettingPath = `${this.cdnPath}model/${modelName}/index.json`;
                const textureCache = yield this.loadTextureCache(modelName);
                const modelSetting = yield this.fetchWithCache(modelSettingPath);
                this.modelTexturesId = Math.floor(Math.random() * textureCache.length);
                let textures = textureCache[this.modelTexturesId];
                if (typeof textures === 'string')
                    textures = [textures];
                modelSetting.textures = textures;
                yield this.loadLive2d(modelSettingPath, modelSetting);
                showMessage('我的新衣服好看嘛？', 4000, 10);
            }
        });
    }
    loadNextModel() {
        return __awaiter(this, void 0, void 0, function* () {
            let { modelId } = this;
            this.modelTexturesId = 0;
            if (this.useCDN) {
                if (!this.modelList) {
                    this.modelList = yield this.loadModelList();
                }
                const index = ++modelId >= this.modelList.models.length ? 0 : modelId;
                this.modelId = index;
                yield this.loadModel(this.modelList.messages[index]);
            }
        });
    }
}
export { ModelManager };
