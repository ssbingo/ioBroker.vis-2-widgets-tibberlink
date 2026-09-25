import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
    plugins: [
        react(),
        federation({
            name: 'vis2TibberWidgets',
            filename: 'customWidgets.js',
            exposes: {
                './TibberCurrentPrice':   './src/TibberCurrentPrice',
                './TibberCheapestWindow': './src/TibberCheapestWindow',
                './TibberLivePower':      './src/TibberLivePower',
                './TibberMonthlyCost':    './src/TibberMonthlyCost',
                './translations':         './src/translations',
            },
            shared: {},
        }),
    ],
    build: {
        outDir: '../widgets/vis-2-widgets-tibberlink',
        emptyOutDir: true,
        target: 'esnext',
        assetsDir: '',
        // Must stay 'esbuild'. Vite 8 is Rolldown-based and minify:true means the oxc
        // minifier, which rewrites string literals to template literals. That defeats the
        // regex @originjs/vite-plugin-federation uses in generateBundle to replace its
        // '__v__css__<path>' placeholders -- it only matches ["'] quotes. The placeholder
        // then survives into customWidgets.js and VIS-2 fails to load every widget with
        // "TypeError: e.forEach is not a function" (broken in v0.4.12 - v0.4.14).
        minify: 'esbuild',
        rollupOptions: {
            input: 'src/bootstrap.js',
            output: {
                format: 'esm',
                minifyInternalExports: true,
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
            },
        },
    },
});
