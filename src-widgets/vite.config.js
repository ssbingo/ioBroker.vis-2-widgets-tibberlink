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
            shared: {
                // Only share React itself — vis-2 provides it as ESM singleton.
                // @iobroker/adapter-react-v5 and @iobroker/vis-2-widgets-react-dev
                // are bundled locally to avoid vis-2 injecting its own incompatible
                // chunks via init() → importShared → dynamic import failure.
                react:            { singleton: true, requiredVersion: '*' },
                'react-dom':      { singleton: true, requiredVersion: '*' },
                '@mui/material':  { singleton: true, requiredVersion: '*' },
            },
        }),
    ],
    build: {
        outDir: '../widgets/vis-2-widgets-tibberlink',
        emptyOutDir: true,
        target: 'esnext',
        assetsDir: '',
        minify: true,
        rollupOptions: {
            input: 'src/bootstrap.js',
            output: {
                format: 'esm',
                minifyInternalExports: true,
            },
        },
    },
});
