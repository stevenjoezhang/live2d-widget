export class L2DBaseModel {
    live2DModel: any;
    modelMatrix: L2DModelMatrix;
    eyeBlink: any;
    physics: L2DPhysics;
    pose: L2DPose;
    initialized: boolean;
    updating: boolean;
    alpha: number;
    accAlpha: number;
    lipSync: boolean;
    lipSyncValue: number;
    accelX: number;
    accelY: number;
    accelZ: number;
    dragX: number;
    dragY: number;
    startTimeMSec: any;
    mainMotionManager: L2DMotionManager;
    expressionManager: L2DMotionManager;
    motions: {};
    expressions: {};
    isTexLoaded: boolean;
    getModelMatrix(): L2DModelMatrix;
    setAlpha(a: any): void;
    getAlpha(): number;
    isInitialized(): boolean;
    setInitialized(v: any): void;
    isUpdating(): boolean;
    setUpdating(v: any): void;
    getLive2DModel(): any;
    setLipSync(v: any): void;
    setLipSyncValue(v: any): void;
    setAccel(x: any, y: any, z: any): void;
    setDrag(x: any, y: any): void;
    getMainMotionManager(): L2DMotionManager;
    getExpressionManager(): L2DMotionManager;
    loadModelData(path: any, callback: any): void;
    loadTexture(no: any, path: any, callback: any): void;
    loadMotion(name: any, path: any, callback: any): void;
    loadExpression(name: any, path: any, callback: any): void;
    loadPose(path: any, callback: any): void;
    loadPhysics(path: any): void;
    hitTestSimple(drawID: any, testX: any, testY: any): boolean;
}
export class L2DViewMatrix extends L2DMatrix44 {
    screenLeft: any;
    screenRight: any;
    screenTop: any;
    screenBottom: any;
    maxLeft: any;
    maxRight: any;
    maxTop: any;
    maxBottom: any;
    max: number;
    min: number;
    getMaxScale(): number;
    getMinScale(): number;
    setMaxScale(v: any): void;
    setMinScale(v: any): void;
    isMaxScale(): boolean;
    isMinScale(): boolean;
    adjustTranslate(shiftX: any, shiftY: any): void;
    adjustScale(cx: any, cy: any, scale: any): void;
    setScreenRect(left: any, right: any, bottom: any, top: any): void;
    setMaxScreenRect(left: any, right: any, bottom: any, top: any): void;
    getScreenLeft(): any;
    getScreenRight(): any;
    getScreenBottom(): any;
    getScreenTop(): any;
    getMaxLeft(): any;
    getMaxRight(): any;
    getMaxBottom(): any;
    getMaxTop(): any;
}
export class L2DEyeBlink {
    nextBlinkTime: any;
    stateStartTime: any;
    blinkIntervalMsec: number;
    eyeState: string;
    closingMotionMsec: number;
    closedMotionMsec: number;
    openingMotionMsec: number;
    closeIfZero: boolean;
    eyeID_L: string;
    eyeID_R: string;
    calcNextBlink(): any;
    setInterval(blinkIntervalMsec: any): void;
    setEyeMotion(closingMotionMsec: any, closedMotionMsec: any, openingMotionMsec: any): void;
    updateParam(model: any): void;
}
export class Live2DFramework {
    static getPlatformManager(): any;
    static setPlatformManager(platformManager: any): void;
}
export namespace Live2DFramework {
    let platformManager: any;
}
export class L2DMatrix44 {
    static mul(a: any, b: any, dst: any): void;
    tr: Float32Array<ArrayBuffer>;
    identity(): void;
    getArray(): Float32Array<ArrayBuffer>;
    getCopyMatrix(): Float32Array<ArrayBuffer>;
    setMatrix(tr: any): void;
    getScaleX(): number;
    getScaleY(): number;
    transformX(src: any): number;
    transformY(src: any): number;
    invertTransformX(src: any): number;
    invertTransformY(src: any): number;
    multTranslate(shiftX: any, shiftY: any): void;
    translate(x: any, y: any): void;
    translateX(x: any): void;
    translateY(y: any): void;
    multScale(scaleX: any, scaleY: any): void;
    scale(scaleX: any, scaleY: any): void;
}
export class L2DTargetPoint {
    EPSILON: number;
    faceTargetX: number;
    faceTargetY: number;
    faceX: number;
    faceY: number;
    faceVX: number;
    faceVY: number;
    lastTimeSec: number;
    setPoint(x: any, y: any): void;
    getX(): number;
    getY(): number;
    update(): void;
}
export namespace L2DTargetPoint {
    let FRAME_RATE: number;
}
declare class L2DModelMatrix extends L2DMatrix44 {
    constructor(w: any, h: any);
    width: any;
    height: any;
    setPosition(x: any, y: any): void;
    setCenterPosition(x: any, y: any): void;
    top(y: any): void;
    bottom(y: any): void;
    left(x: any): void;
    right(x: any): void;
    centerX(x: any): void;
    centerY(y: any): void;
    setX(x: any): void;
    setY(y: any): void;
    setHeight(h: any): void;
    setWidth(w: any): void;
}
declare class L2DPhysics {
    static load(buf: any): L2DPhysics;
    physicsList: any[];
    startTimeMSec: any;
    updateParam(model: any): void;
}
declare class L2DPose {
    static load(buf: any): L2DPose;
    lastTime: number;
    lastModel: any;
    partsGroups: any[];
    updateParam(model: any): void;
    initParam(model: any): void;
    normalizePartsOpacityGroup(model: any, partsGroup: any, deltaTimeSec: any): void;
    copyOpacityOtherParts(model: any, partsGroup: any): void;
}
declare class L2DMotionManager {
    currentPriority: any;
    reservePriority: any;
    super: any;
    getCurrentPriority(): any;
    getReservePriority(): any;
    reserveMotion(priority: any): boolean;
    setReservePriority(val: any): void;
    updateParam(model: any): any;
    startMotionPrio(motion: any, priority: any): any;
}
export {};
