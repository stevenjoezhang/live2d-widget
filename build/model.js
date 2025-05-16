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
import showMessage from './message.js';
import randomSelection from './utils.js';
import Model from './live2d/index.js';
var ModelManager = (function () {
    function ModelManager(config) {
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
        this.useCDN = useCDN;
        this.apiPath = apiPath || '';
        this.cdnPath = cdnPath || '';
        this.model = new Model();
        this.modelInitialized = false;
    }
    ModelManager.prototype.loadLive2d = function (modelSettingPath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.modelInitialized) return [3, 2];
                        this.modelInitialized = true;
                        return [4, this.model.init('live2d', modelSettingPath)];
                    case 1:
                        _a.sent();
                        return [3, 4];
                    case 2: return [4, this.model.changeModel(modelSettingPath)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        console.log("Live2D Model ".concat(modelSettingPath, " Loaded"));
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
    ModelManager.prototype.loadModel = function (modelId, modelTexturesId, message) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, target;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        localStorage.setItem('modelId', modelId.toString());
                        localStorage.setItem('modelTexturesId', modelTexturesId.toString());
                        if (!this.useCDN) return [3, 4];
                        if (!!this.modelList) return [3, 2];
                        _a = this;
                        return [4, this.loadModelList()];
                    case 1:
                        _a.modelList = _b.sent();
                        _b.label = 2;
                    case 2:
                        target = randomSelection(this.modelList.models[modelId]);
                        return [4, this.loadLive2d("".concat(this.cdnPath, "model/").concat(target, "/index.json"))];
                    case 3:
                        _b.sent();
                        return [3, 6];
                    case 4: return [4, this.loadLive2d("".concat(this.apiPath, "get/?id=").concat(modelId, "-").concat(modelTexturesId))];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6:
                        showMessage(message, 4000, 10);
                        return [2];
                }
            });
        });
    };
    ModelManager.prototype.loadRandModel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var modelId, modelTexturesId, _a, target;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        modelId = Number(localStorage.getItem('modelId'));
                        modelTexturesId = Number(localStorage.getItem('modelTexturesId'));
                        if (!(this.useCDN && modelId)) return [3, 4];
                        if (!!this.modelList) return [3, 2];
                        _a = this;
                        return [4, this.loadModelList()];
                    case 1:
                        _a.modelList = _b.sent();
                        _b.label = 2;
                    case 2:
                        target = randomSelection(this.modelList.models[modelId]);
                        return [4, this.loadLive2d("".concat(this.cdnPath, "model/").concat(target, "/index.json"))];
                    case 3:
                        _b.sent();
                        showMessage('我的新衣服好看嘛？', 4000, 10);
                        return [3, 5];
                    case 4:
                        fetch("".concat(this.apiPath, "rand_textures/?id=").concat(modelId, "-").concat(modelTexturesId))
                            .then(function (response) { return response.json(); })
                            .then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!(result.textures.id === 1 &&
                                            (modelTexturesId === 1 || modelTexturesId === 0))) return [3, 1];
                                        showMessage('我还没有其他衣服呢！', 4000, 10);
                                        return [3, 3];
                                    case 1:
                                        if (!modelId) return [3, 3];
                                        return [4, this.loadModel(modelId, result.textures.id, '我的新衣服好看嘛？')];
                                    case 2:
                                        _a.sent();
                                        _a.label = 3;
                                    case 3: return [2];
                                }
                            });
                        }); });
                        _b.label = 5;
                    case 5: return [2];
                }
            });
        });
    };
    ModelManager.prototype.loadOtherModel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var modelId, _a, index;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        modelId = Number(localStorage.getItem('modelId'));
                        if (!(this.useCDN && modelId)) return [3, 4];
                        if (!!this.modelList) return [3, 2];
                        _a = this;
                        return [4, this.loadModelList()];
                    case 1:
                        _a.modelList = _b.sent();
                        _b.label = 2;
                    case 2:
                        index = ++modelId >= this.modelList.models.length ? 0 : modelId;
                        return [4, this.loadModel(index, 0, this.modelList.messages[index])];
                    case 3:
                        _b.sent();
                        return [3, 5];
                    case 4:
                        fetch("".concat(this.apiPath, "switch/?id=").concat(modelId))
                            .then(function (response) { return response.json(); })
                            .then(function (result) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4, this.loadModel(result.model.id, 0, result.model.message)];
                                    case 1:
                                        _a.sent();
                                        return [2];
                                }
                            });
                        }); });
                        _b.label = 5;
                    case 5: return [2];
                }
            });
        });
    };
    return ModelManager;
}());
export default ModelManager;
