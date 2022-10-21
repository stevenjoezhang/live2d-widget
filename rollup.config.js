import { nodeResolve } from "@rollup/plugin-node-resolve";
import { createFilter } from "@rollup/pluginutils";

function string(opts = {}) {
    if (!opts.include) {
        throw Error("include option should be specified");
    }

    const filter = createFilter(opts.include, opts.exclude);

    return {
        name: "string",

        transform(code, id) {
            if (filter(id)) {
                return {
                    code: `export default ${JSON.stringify(code)};`,
                    map: { mappings: "" }
                };
            }
        },

        renderChunk(code, chunk, outputOptions = {}) {
            return `/*!
 * Live2D Widget
 * https://github.com/stevenjoezhang/live2d-widget
 */
` + code;
        }
    };
}

export default {
    input: "src/waifu-tips.js",
    plugins: [nodeResolve(), string({
        include: "**/*.svg",
    })]
};
