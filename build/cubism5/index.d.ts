export class AppDelegate extends LAppDelegate {
    _drawFrameId: number;
    stop(): void;
    transformOffset(e: any): {
        x: number;
        y: number;
    };
    onMouseMove(e: any): void;
    onMouseEnd(e: any): void;
    onTap(e: any): void;
    mouseMoveEventListener: any;
    mouseEndedEventListener: any;
    tapEventListener: any;
    changeModel(modelSettingPath: string): void;
    get subdelegates(): import("@framework/type/csmvector.js").csmVector<LAppSubdelegate>;
}
import { LAppDelegate } from '@demo/lappdelegate.js';
import { LAppSubdelegate } from '@demo/lappsubdelegate.js';
