import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import cleanup from 'rollup-plugin-cleanup';
import copy from 'rollup-plugin-copy';
import styles from 'rollup-plugin-styles';

const buildPath = 'dist';

const globals = {
  '@gi-types/gtk4': 'imports.gi.Gtk',
  '@gi-types/adw1': 'imports.gi.Adw',
  '@gi-types/gvc1': 'imports.gi.Gvc',
};

const external = [...Object.keys(globals)];


const prefsBanner = [
  'const GIRepository = imports.gi.GIRepository;',
  'const GLib = imports.gi.GLib;',
  'let libdir = GIRepository.Repository.get_search_path().find(path => {',
  '  return path.endsWith("/gjs/girepository-1.0");',
  '}).replace("/gjs/girepository-1.0", "");',
  'const gsdir = GLib.build_filenamev([libdir, "gnome-shell"]);',
  'if (!GLib.file_test(gsdir, GLib.FileTest.IS_DIR)) {',
  '  const currentDir = `/${GLib.path_get_basename(libdir)}`;',
  '  libdir = libdir.replace(currentDir, "");',
  '}',
  'const typelibDir = GLib.build_filenamev([libdir, "gnome-shell"]);',
  'GIRepository.Repository.prepend_search_path(typelibDir);',
  'GIRepository.Repository.prepend_library_path(typelibDir);'
].join('\n');

const prefsFooter = [
  'var init = prefs.init;', 
  'var fillPreferencesWindow = prefs.fillPreferencesWindow;'
].join('\n');

export default [
  {
    input: 'src/extension.ts',
    treeshake: {
      moduleSideEffects: 'no-external',
    },
    output: {
      file: `${buildPath}/extension.js`,
      format: 'iife',
      name: 'init',
      exports: 'default',
      globals,
      assetFileNames: '[name][extname]',
    },
    external,
    plugins: [
      commonjs(),
      nodeResolve({
        preferBuiltins: false,
      }),
      typescript({
        tsconfig: './tsconfig.json',
      }),
      styles({
        mode: ['extract', `stylesheet.css`],
      }),
      copy({
        targets: [
          { src: './resources/icons', dest: `${buildPath}` },
          { src: './resources/images', dest: `${buildPath}` },
          { src: './resources/metadata.json', dest: `${buildPath}` },
          { src: './resources/schemas', dest: `${buildPath}` },
          { src: './resources/dbus', dest: `${buildPath}` },
        ],
      }),
      cleanup({
        comments: 'none',
      })
    ],
  },
  {
    input: 'src/prefs.ts',
    output: {
      file: `${buildPath}/prefs.js`,
      format: 'iife',
      exports: 'default',
      name: 'prefs',
      globals,
      banner: prefsBanner,
      footer: prefsFooter
    },
    treeshake: {
      moduleSideEffects: 'no-external',
    },
    external,
    plugins: [
      commonjs(),
      nodeResolve({
        preferBuiltins: false,
      }),
      typescript({
        tsconfig: './tsconfig.json',
      }),
      cleanup({
        comments: 'none',
      }),
    ],
  },
];
