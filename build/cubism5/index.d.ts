export class AppDelegate {
    run(): void;
    _drawFrameId: number;
    stop(): void;
    release(): void;
    _cubismOption: any;
    transformOffset(e: any): {
        x: any;
        y: any;
    };
    onMouseMove(e: any): void;
    onMouseEnd(e: any): void;
    onTap(e: any): void;
    initializeEventListener(): void;
    mouseMoveEventListener: any;
    mouseEndedEventListener: any;
    tapEventListener: any;
    releaseEventListener(): void;
    initializeSubdelegates(): void;
    changeModel(modelSettingPath: string): void;
    get subdelegates(): any;
}
