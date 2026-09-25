import { readFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
import { moduleFederationShared } from '@iobroker/types-vis-2/modulefederation.vis.config';

const pack = JSON.parse(readFileSync('./package.json').toString());

const OUT_DIR = '../widgets/vis-2-widgets-tibberlink';

// index.html only exists so that vite has an app entry for the build - the widgets are served
// through customWidgets.js. mf-stats.json is the verbose twin of mf-manifest.json and nothing
// reads it here. Neither belongs in the published package, so drop both once the build is written.
const dropBuildLeftovers = {
    name: 'drop-build-leftovers',
    closeBundle() {
        for (const file of ['index.html', 'mf-stats.json']) {
            rmSync(resolve(OUT_DIR, file), { force: true });
        }
    },
};

// Module Federation 2 - the same runtime vis-2 itself runs. It emits customWidgets.js
// (the remote entry named in io-package.json -> common.visWidgets) next to mf-manifest.json.
//
// The manifest is mandatory, not a build artifact we could drop: vis-2 reads it in
// visWidgetSetCompatibility.ts and skips any widget set whose "shared" list lacks react or
// react/jsx-runtime. A set that bundles its own JSX runtime stamps its elements with a
// different symbol than react 19 expects, so vis-2 locks it out instead of letting it fail
// somewhere deep in the render. moduleFederationShared() declares both as singletons, which
// means react comes from vis-2 at runtime and is never bundled here.
export default {
    plugins: [
        federation({
            manifest: true,
            name: 'vis2TibberWidgets',
            filename: 'customWidgets.js',
            exposes: {
                './TibberCurrentPrice': './src/TibberCurrentPrice',
                './TibberCheapestWindow': './src/TibberCheapestWindow',
                './TibberLivePower': './src/TibberLivePower',
                './TibberMonthlyCost': './src/TibberMonthlyCost',
                './translations': './src/translations',
            },
            remotes: {},
            shared: moduleFederationShared(pack),
            dts: false,
        }),
        react(),
        dropBuildLeftovers,
    ],
    base: './',
    build: {
        target: 'es2022',
        outDir: OUT_DIR,
        emptyOutDir: true,
    },
};
