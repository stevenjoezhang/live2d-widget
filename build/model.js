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
var Model = /** @class */ (function () {
    function Model(config) {
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
    }
    Model.prototype.loadModelList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.cdnPath, "model_list.json"))];
                    case 1:
                        response = _b.sent();
                        _a = this;
                        return [4 /*yield*/, response.json()];
                    case 2:
                        _a.modelList = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Model.prototype.loadModel = function (modelId, modelTexturesId, message) {
        return __awaiter(this, void 0, void 0, function () {
            var target;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        localStorage.setItem('modelId', modelId.toString());
                        localStorage.setItem('modelTexturesId', modelTexturesId.toString());
                        showMessage(message, 4000, 10);
                        if (!(this.useCDN && this.modelList)) return [3 /*break*/, 3];
                        if (!!this.modelList) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.loadModelList()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        target = randomSelection(this.modelList.models[modelId]);
                        loadlive2d('live2d', "".concat(this.cdnPath, "model/").concat(target, "/index.json"));
                        return [3 /*break*/, 4];
                    case 3:
                        loadlive2d('live2d', "".concat(this.apiPath, "get/?id=").concat(modelId, "-").concat(modelTexturesId));
                        console.log("Live2D Model ".concat(modelId, "-").concat(modelTexturesId, " Loaded"));
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Model.prototype.loadRandModel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var modelId, modelTexturesId, target;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modelId = Number(localStorage.getItem('modelId'));
                        modelTexturesId = Number(localStorage.getItem('modelTexturesId'));
                        if (!(this.useCDN && modelId && this.modelList)) return [3 /*break*/, 3];
                        if (!!this.modelList) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.loadModelList()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        target = randomSelection(this.modelList.models[modelId]);
                        loadlive2d('live2d', "".concat(this.cdnPath, "model/").concat(target, "/index.json"));
                        showMessage('我的新衣服好看嘛？', 4000, 10);
                        return [3 /*break*/, 4];
                    case 3:
                        // Optional "rand" (Random), "switch" (Switch by order)
                        fetch("".concat(this.apiPath, "rand_textures/?id=").concat(modelId, "-").concat(modelTexturesId))
                            .then(function (response) { return response.json(); })
                            .then(function (result) {
                            if (result.textures.id === 1 &&
                                (modelTexturesId === 1 || modelTexturesId === 0)) {
                                showMessage('我还没有其他衣服呢！', 4000, 10);
                            }
                            else if (modelId) {
                                _this.loadModel(modelId, result.textures.id, '我的新衣服好看嘛？');
                            }
                        });
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Model.prototype.loadOtherModel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var modelId, index;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modelId = Number(localStorage.getItem('modelId'));
                        if (!(this.useCDN && modelId && this.modelList)) return [3 /*break*/, 3];
                        if (!!this.modelList) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.loadModelList()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        index = ++modelId >= this.modelList.models.length ? 0 : modelId;
                        void this.loadModel(index, 0, this.modelList.messages[index]);
                        return [3 /*break*/, 4];
                    case 3:
                        fetch("".concat(this.apiPath, "switch/?id=").concat(modelId))
                            .then(function (response) { return response.json(); })
                            .then(function (result) {
                            _this.loadModel(result.model.id, 0, result.model.message);
                        });
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return Model;
}());
export default Model;
