import { Config } from './model.js';
import { Time } from './message.js';
interface Tools {
    [key: string]: {
        icon: string;
        callback: () => void;
    };
}
interface Tips {
    message: {
        default: string[];
        console: string;
        copy: string;
        visibilitychange: string;
    };
    time: Time;
    mouseover: {
        selector: string;
        text: string | string[];
    }[];
    click: {
        selector: string;
        text: string | string[];
    }[];
    seasons: {
        date: string;
        text: string | string[];
    }[];
}
declare function initWidget(config: string | Config): void;
export { initWidget, Tools, Tips };
