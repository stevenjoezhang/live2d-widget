import type { Config, ModelManager } from './model.js';
import type { Tips } from './widget.js';
interface Tools {
    [key: string]: {
        icon: string;
        callback: (message: any) => void;
    };
}
declare class ToolsManager {
    tools: Tools;
    config: Config;
    constructor(model: ModelManager, config: Config, tips: Tips);
    registerTools(): void;
}
export { ToolsManager, Tools };
