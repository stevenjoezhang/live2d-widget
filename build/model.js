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
import { loadExternalResource, randomOtherOption } from './utils.js';
import logger from './logger.js';
class ModelManager {
    constructor(config, models = []) {
        var _a;
        this.modelList = null;
        let { apiPath, cdnPath } = config;
        const { cubism2Path, cubism5Path } = config;
        let useCDN = false;
        if (typeof cdnPath === 'string') {
            if (!cdnPath.endsWith('/'))
                cdnPath += '/';
            useCDN = true;
        }
        else if (typeof apiPath === 'string') {
            if (!apiPath.endsWith('/'))
                apiPath += '/';
            cdnPath = apiPath;
            useCDN = true;
            logger.warn('apiPath option is deprecated. Please use cdnPath instead.');
        }
        else if (!models.length) {
            throw 'Invalid initWidget argument!';
        }
        let modelId = parseInt(localStorage.getItem('modelId'), 10);
        let modelTexturesId = parseInt(localStorage.getItem('modelTexturesId'), 10);
        if (isNaN(modelId) || isNaN(modelTexturesId)) {
            modelTexturesId = 0;
        }
        if (isNaN(modelId)) {
            modelId = (_a = config.modelId) !== null && _a !== void 0 ? _a : 0;
        }
        this.useCDN = useCDN;
        this.cdnPath = cdnPath || '';
        this.cubism2Path = cubism2Path || '';
        this.cubism5Path = cubism5Path || '';
        this._modelId = modelId;
        this._modelTexturesId = modelTexturesId;
        this.currentModelVersion = 0;
        this.loading = false;
        this.modelJSONCache = {};
        this.models = models;
    }
    static initCheck(config_1) {
        return __awaiter(this, arguments, void 0, function* (config, models = []) {
            const model = new ModelManager(config, models);
            if (model.useCDN) {
                const response = yield fetch(`${model.cdnPath}model_list.json`);
                model.modelList = yield response.json();
                if (model.modelId >= model.modelList.models.length) {
                    model.modelId = 0;
                }
                const modelName = model.modelList.models[model.modelId];
                if (Array.isArray(modelName)) {
                    if (model.modelTexturesId >= modelName.length) {
                        model.modelTexturesId = 0;
                    }
                }
                else {
                    const modelSettingPath = `${model.cdnPath}model/${modelName}/index.json`;
                    const modelSetting = yield model.fetchWithCache(modelSettingPath);
                    const version = model.checkModelVersion(modelSetting);
                    if (version === 2) {
                        const textureCache = yield model.loadTextureCache(modelName);
                        if (model.modelTexturesId >= textureCache.length) {
                            model.modelTexturesId = 0;
                        }
                    }
                }
            }
            else {
                if (model.modelId >= model.models.length) {
                    model.modelId = 0;
                }
                if (model.modelTexturesId >= model.models[model.modelId].paths.length) {
                    model.modelTexturesId = 0;
                }
            }
            return model;
        });
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
    resetCanvas() {
        document.getElementById('waifu-canvas').innerHTML = '<canvas id="live2d" width="800" height="800"></canvas>';
    }
    fetchWithCache(url) {
        return __awaiter(this, void 0, void 0, function* () {
            let result;
            if (url in this.modelJSONCache) {
                result = this.modelJSONCache[url];
            }
            else {
                try {
                    const response = yield fetch(url);
                    result = yield response.json();
                }
                catch (_a) {
                    result = null;
                }
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
    loadLive2D(modelSettingPath, modelSetting) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.loading) {
                logger.warn('Still loading. Abort.');
                return;
            }
            this.loading = true;
            try {
                const version = this.checkModelVersion(modelSetting);
                if (version === 2) {
                    if (!this.cubism2model) {
                        if (!this.cubism2Path) {
                            logger.error('No cubism2Path set, cannot load Cubism 2 Core.');
                            return;
                        }
                        yield loadExternalResource(this.cubism2Path, 'js');
                        const { default: Cubism2Model } = yield import('./cubism2/index.js');
                        this.cubism2model = new Cubism2Model();
                    }
                    if (this.currentModelVersion === 3) {
                        this.cubism5model.release();
                        this.resetCanvas();
                    }
                    if (this.currentModelVersion === 3 || !this.cubism2model.gl) {
                        yield this.cubism2model.init('live2d', modelSettingPath, modelSetting);
                    }
                    else {
                        yield this.cubism2model.changeModelWithJSON(modelSettingPath, modelSetting);
                    }
                }
                else {
                    if (!this.cubism5Path) {
                        logger.error('No cubism5Path set, cannot load Cubism 5 Core.');
                        return;
                    }
                    yield loadExternalResource(this.cubism5Path, 'js');
                    const { AppDelegate: Cubism5Model } = yield import('./cubism5/index.js');
                    this.cubism5model = new Cubism5Model();
                    if (this.currentModelVersion === 2) {
                        this.cubism2model.destroy();
                        this.resetCanvas();
                    }
                    if (this.currentModelVersion === 2 || !this.cubism5model.subdelegates.at(0)) {
                        this.cubism5model.initialize();
                        this.cubism5model.changeModel(modelSettingPath);
                        this.cubism5model.run();
                    }
                    else {
                        this.cubism5model.changeModel(modelSettingPath);
                    }
                }
                logger.info(`Model ${modelSettingPath} (Cubism version ${version}) loaded`);
                this.currentModelVersion = version;
            }
            catch (err) {
                console.error('loadLive2D failed', err);
            }
            this.loading = false;
        });
    }
    loadTextureCache(modelName) {
        return __awaiter(this, void 0, void 0, function* () {
            const textureCache = yield this.fetchWithCache(`${this.cdnPath}model/${modelName}/textures.cache`);
            return textureCache || [];
        });
    }
    loadModel(message) {
        return __awaiter(this, void 0, void 0, function* () {
            let modelSettingPath, modelSetting;
            if (this.useCDN) {
                let modelName = this.modelList.models[this.modelId];
                if (Array.isArray(modelName)) {
                    modelName = modelName[this.modelTexturesId];
                }
                modelSettingPath = `${this.cdnPath}model/${modelName}/index.json`;
                modelSetting = yield this.fetchWithCache(modelSettingPath);
                const version = this.checkModelVersion(modelSetting);
                if (version === 2) {
                    const textureCache = yield this.loadTextureCache(modelName);
                    let textures = textureCache[this.modelTexturesId];
                    if (typeof textures === 'string')
                        textures = [textures];
                    modelSetting.textures = textures;
                }
            }
            else {
                modelSettingPath = this.models[this.modelId].paths[this.modelTexturesId];
                modelSetting = yield this.fetchWithCache(modelSettingPath);
            }
            yield this.loadLive2D(modelSettingPath, modelSetting);
            showMessage(message, 4000, 10);
        });
    }
    loadRandTexture() {
        return __awaiter(this, arguments, void 0, function* (successMessage = '', failMessage = '') {
            const { modelId } = this;
            let noTextureAvailable = false;
            if (this.useCDN) {
                const modelName = this.modelList.models[modelId];
                if (Array.isArray(modelName)) {
                    this.modelTexturesId = randomOtherOption(modelName.length, this.modelTexturesId);
                }
                else {
                    const modelSettingPath = `${this.cdnPath}model/${modelName}/index.json`;
                    const modelSetting = yield this.fetchWithCache(modelSettingPath);
                    const version = this.checkModelVersion(modelSetting);
                    if (version === 2) {
                        const textureCache = yield this.loadTextureCache(modelName);
                        if (textureCache.length <= 1) {
                            noTextureAvailable = true;
                        }
                        else {
                            this.modelTexturesId = randomOtherOption(textureCache.length, this.modelTexturesId);
                        }
                    }
                    else {
                        noTextureAvailable = true;
                    }
                }
            }
            else {
                if (this.models[modelId].paths.length === 1) {
                    noTextureAvailable = true;
                }
                else {
                    this.modelTexturesId = randomOtherOption(this.models[modelId].paths.length, this.modelTexturesId);
                }
            }
            if (noTextureAvailable) {
                showMessage(failMessage, 4000, 10);
            }
            else {
                yield this.loadModel(successMessage);
            }
        });
    }
    loadNextModel() {
        return __awaiter(this, void 0, void 0, function* () {
            this.modelTexturesId = 0;
            if (this.useCDN) {
                this.modelId = (this.modelId + 1) % this.modelList.models.length;
                yield this.loadModel(this.modelList.messages[this.modelId]);
            }
            else {
                this.modelId = (this.modelId + 1) % this.models.length;
                yield this.loadModel(this.models[this.modelId].message);
            }
        });
    }
}
export { ModelManager };
