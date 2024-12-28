/**
 * @file 包含看板娘工具的配置和函数。
 * @module tools
 */
/**
 * 显示一句一言。
 */
declare function showHitokoto(): void;
/**
 * 看板娘工具配置。
 * @type {Object}
 */
declare const tools: {
    hitokoto: {
        icon: string;
        callback: typeof showHitokoto;
    };
    asteroids: {
        icon: string;
        callback: () => void;
    };
    'switch-model': {
        icon: string;
        callback: () => void;
    };
    'switch-texture': {
        icon: string;
        callback: () => void;
    };
    photo: {
        icon: string;
        callback: () => void;
    };
    info: {
        icon: string;
        callback: () => void;
    };
    quit: {
        icon: string;
        callback: () => void;
    };
};
export default tools;
