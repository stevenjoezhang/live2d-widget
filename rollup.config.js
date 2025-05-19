import terser from '@rollup/plugin-terser';
import alias from '@rollup/plugin-alias';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function findCubismDir() {
  const buildDir = path.join(__dirname, 'build');
  let candidates = fs.readdirSync(buildDir)
    .filter(f => f.startsWith('CubismSdkForWeb-') && fs.statSync(path.join(buildDir, f)).isDirectory());
  if (candidates.length === 0) {
    candidates = ['CubismSdkForWeb-5-r.4'];
  }
  return path.join(buildDir, candidates[0]);
}

const cubismDir = findCubismDir();

export default {
  input: 'build/waifu-tips.js',
  output: {
    dir: 'dist/',
    format: 'esm',
    chunkFileNames: 'chunk/[name].js',
    sourcemap: true,
    banner: `/*!
 * Live2D Widget
 * https://github.com/stevenjoezhang/live2d-widget
 */
`
  },
  plugins: [
    alias({
      entries: [
        {
          find: '@demo',
          replacement: path.resolve(cubismDir, 'Samples/TypeScript/Demo/src/')
        },
        {
          find: '@framework',
          replacement: path.resolve(cubismDir, 'Framework/src/')
        }
      ]
    }),
    terser(),
  ],
  context: 'this',
};
