var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { showMessage } from './message.js';
import { randomSelection } from './utils.js';
import Model from './live2d/index.js';
import logger from './logger.js';
var ModelManager = (function () {
    function ModelManager(config) {
        var _a;
        this.modelList = null;
        var apiPath = config.apiPath, cdnPath = config.cdnPath;
        var useCDN = false;
        if (typeof cdnPath === 'string') {
            useCDN = true;
            if (!cdnPath.endsWith('/'))
                cdnPath += '/';
        }
        else if (typeof apiPath === 'string') {
            if (!apiPath.endsWith('/'))
                apiPath += '/';
        }
        else {
            throw 'Invalid initWidget argument!';
        }
        var modelId = parseInt(localStorage.getItem('modelId'), 10);
        var modelTexturesId = parseInt(localStorage.getItem('modelTexturesId'), 10);
        if (isNaN(modelId) || isNaN(modelTexturesId)) {
            modelTexturesId = 0;
        }
        if (isNaN(modelId)) {
            modelId = (_a = config.modelId) !== null && _a !== void 0 ? _a : (useCDN ? 0 : 1);
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
    Object.defineProperty(ModelManager.prototype, "modelId", {
        get: function () {
            return this._modelId;
        },
        set: function (modelId) {
            this._modelId = modelId;
            localStorage.setItem('modelId', modelId.toString());
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ModelManager.prototype, "modelTexturesId", {
        get: function () {
            return this._modelTexturesId;
        },
        set: function (modelTexturesId) {
            this._modelTexturesId = modelTexturesId;
            localStorage.setItem('modelTexturesId', modelTexturesId.toString());
        },
        enumerable: false,
        configurable: true
    });
    ModelManager.prototype.fetchWithCache = function (url) {
        return __awaiter(this, void 0, void 0, function () {
            var result, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(url in this.modelJSONCache)) return [3, 1];
                        result = this.modelJSONCache[url];
                        return [3, 4];
                    case 1: return [4, fetch(url)];
                    case 2:
                        response = _a.sent();
                        return [4, response.json()];
                    case 3:
                        result = _a.sent();
                        this.modelJSONCache[url] = result;
                        _a.label = 4;
                    case 4: return [2, result];
                }
            });
        });
    };
    ModelManager.prototype.loadLive2d = function (modelSettingPath, modelSetting) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.modelInitialized) return [3, 2];
                        this.modelInitialized = true;
                        return [4, this.model.init('live2d', modelSettingPath, modelSetting)];
                    case 1:
                        _a.sent();
                        return [3, 4];
                    case 2: return [4, this.model.changeModelWithJSON(modelSettingPath, modelSetting)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        logger.info("Model ".concat(modelSettingPath, " loaded"));
                        return [2];
                }
            });
        });
    };
    ModelManager.prototype.loadModelList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, modelList;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, fetch("".concat(this.cdnPath, "model_list.json"))];
                    case 1:
                        response = _a.sent();
                        return [4, response.json()];
                    case 2:
                        modelList = _a.sent();
                        return [2, modelList];
                }
            });
        });
    };
    ModelManager.prototype.loadTextureCache = function (modelName) {
        return __awaiter(this, void 0, void 0, function () {
            var textureCache;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.fetchWithCache("".concat(this.cdnPath, "model/").concat(modelName, "/textures.cache"))];
                    case 1:
                        textureCache = _a.sent();
                        return [2, textureCache];
                }
            });
        });
    };
    ModelManager.prototype.loadModel = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, modelId, modelTexturesId, _b, modelName, modelSettingPath, textureCache, modelSetting, textures, modelSettingPath, modelSetting;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this, modelId = _a.modelId, modelTexturesId = _a.modelTexturesId;
                        if (!this.useCDN) return [3, 6];
                        if (!!this.modelList) return [3, 2];
                        _b = this;
                        return [4, this.loadModelList()];
                    case 1:
                        _b.modelList = _c.sent();
                        _c.label = 2;
                    case 2:
                        modelName = randomSelection(this.modelList.models[modelId]);
                        modelSettingPath = "".concat(this.cdnPath, "model/").concat(modelName, "/index.json");
                        return [4, this.loadTextureCache(modelName)];
                    case 3:
                        textureCache = _c.sent();
                        return [4, this.fetchWithCache(modelSettingPath)];
                    case 4:
                        modelSetting = _c.sent();
                        textures = textureCache[modelTexturesId];
                        if (typeof textures === 'string')
                            textures = [textures];
                        modelSetting.textures = textures;
                        return [4, this.loadLive2d(modelSettingPath, modelSetting)];
                    case 5:
                        _c.sent();
                        return [3, 9];
                    case 6:
                        modelSettingPath = "".concat(this.apiPath, "get/?id=").concat(modelId, "-").concat(modelTexturesId);
                        return [4, this.fetchWithCache(modelSettingPath)];
                    case 7:
                        modelSetting = _c.sent();
                        return [4, this.loadLive2d(modelSettingPath, modelSetting)];
                    case 8:
                        _c.sent();
                        _c.label = 9;
                    case 9:
                        showMessage(message, 4000, 10);
                        return [2];
                }
            });
        });
    };
    ModelManager.prototype.loadRandTexture = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, modelId, modelTexturesId, _b, modelName, modelSettingPath, textureCache, modelSetting, textures, response, result;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this, modelId = _a.modelId, modelTexturesId = _a.modelTexturesId;
                        if (!this.useCDN) return [3, 6];
                        if (!!this.modelList) return [3, 2];
                        _b = this;
                        return [4, this.loadModelList()];
                    case 1:
                        _b.modelList = _c.sent();
                        _c.label = 2;
                    case 2:
                        modelName = randomSelection(this.modelList.models[modelId]);
                        modelSettingPath = "".concat(this.cdnPath, "model/").concat(modelName, "/index.json");
                        return [4, this.loadTextureCache(modelName)];
                    case 3:
                        textureCache = _c.sent();
                        return [4, this.fetchWithCache(modelSettingPath)];
                    case 4:
                        modelSetting = _c.sent();
                        this.modelTexturesId = Math.floor(Math.random() * textureCache.length);
                        textures = textureCache[this.modelTexturesId];
                        if (typeof textures === 'string')
                            textures = [textures];
                        modelSetting.textures = textures;
                        return [4, this.loadLive2d(modelSettingPath, modelSetting)];
                    case 5:
                        _c.sent();
                        showMessage('我的新衣服好看嘛？', 4000, 10);
                        return [3, 11];
                    case 6: return [4, fetch("".concat(this.apiPath, "rand_textures/?id=").concat(modelId, "-").concat(modelTexturesId))];
                    case 7:
                        response = _c.sent();
                        return [4, response.json()];
                    case 8:
                        result = _c.sent();
                        if (!(result.textures.id === 1 &&
                            (modelTexturesId === 1 || modelTexturesId === 0))) return [3, 9];
                        showMessage('我还没有其他衣服呢！', 4000, 10);
                        return [3, 11];
                    case 9:
                        this.modelTexturesId = result.textures.id;
                        return [4, this.loadModel('我的新衣服好看嘛？')];
                    case 10:
                        _c.sent();
                        _c.label = 11;
                    case 11: return [2];
                }
            });
        });
    };
    ModelManager.prototype.loadNextModel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var modelId, _a, index, response, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        modelId = this.modelId;
                        this.modelTexturesId = 0;
                        if (!this.useCDN) return [3, 4];
                        if (!!this.modelList) return [3, 2];
                        _a = this;
                        return [4, this.loadModelList()];
                    case 1:
                        _a.modelList = _b.sent();
                        _b.label = 2;
                    case 2:
                        index = ++modelId >= this.modelList.models.length ? 0 : modelId;
                        this.modelId = index;
                        return [4, this.loadModel(this.modelList.messages[index])];
                    case 3:
                        _b.sent();
                        return [3, 8];
                    case 4: return [4, fetch("".concat(this.apiPath, "switch/?id=").concat(modelId))];
                    case 5:
                        response = _b.sent();
                        return [4, response.json()];
                    case 6:
                        result = _b.sent();
                        this.modelId = result.model.id;
                        return [4, this.loadModel(result.model.message)];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8: return [2];
                }
            });
        });
    };
    return ModelManager;
}());
export { ModelManager };
