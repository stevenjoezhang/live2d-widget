import terser from '@rollup/plugin-terser';

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
    name: 'live2d_widget',
    file: 'dist/waifu-tips.js',
    format: 'iife',
  },
  plugins: [
    banner(),
    terser(),
  ],
  context: 'this',
};
