export class AppDelegate extends LAppDelegate {
    _drawFrameId: number;
    stop(): void;
    changeModel(modelSettingPath: string): void;
    get subdelegates(): import("@framework/type/csmvector.js").csmVector<LAppSubdelegate>;
}
import { LAppDelegate } from '@demo/lappdelegate.js';
import { LAppSubdelegate } from '@demo/lappsubdelegate.js';
