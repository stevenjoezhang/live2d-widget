export default PlatformManager;
declare class PlatformManager {
    cache: {};
    loadBytes(path: any, callback: any): any;
    loadLive2DModel(path: any, callback: any): void;
    loadTexture(model: any, no: any, path: any, callback: any): void;
    jsonParseFromBytes(buf: any): any;
}
