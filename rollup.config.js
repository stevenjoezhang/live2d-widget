import terser from '@rollup/plugin-terser';
import alias from '@rollup/plugin-alias';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function banner() {

  return {
    name: 'banner',

    renderChunk(code, chunk, outputOptions = {}) {
      return (
        `/*!
 * Live2D Widget
 * https://github.com/stevenjoezhang/live2d-widget
 */
` + code
      );
    },
  };
}

export default {
  input: 'build/waifu-tips.js',
  output: {
    dir: 'dist/',
    format: 'esm',
    chunkFileNames: 'chunk/[name].js',
  },
  plugins: [
    alias({
      entries: [
        {
          find: '@demo',
          replacement: path.resolve(__dirname, 'build/CubismSdkForWeb-5-r.4/Samples/TypeScript/Demo/src/')
        },
        {
          find: '@framework',
          replacement: path.resolve(__dirname, 'build/CubismSdkForWeb-5-r.4/Framework/src/')
        }
      ]
    }),
    banner(),
    terser(),
  ],
  context: 'this',
};
