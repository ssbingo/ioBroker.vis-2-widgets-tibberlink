const fs = require('fs');
const path = require('path');
const { expect } = require('chai');

const root = path.join(__dirname, '..');
const widgetsDir = path.join(root, 'widgets', 'vis-2-widgets-tibberlink');
const entryFile = path.join(widgetsDir, 'customWidgets.js');
const manifestFile = path.join(widgetsDir, 'mf-manifest.json');

const ioPackage = require(path.join(root, 'io-package.json'));
const widgetSet = ioPackage.common.visWidgets.vis2TibberWidgets;

describe('Built widget bundle', () => {
    let entry;
    let manifest;

    before(() => {
        expect(fs.existsSync(entryFile), `${entryFile} is missing - run "npm run build"`).to.be.true;
        expect(fs.existsSync(manifestFile), `${manifestFile} is missing - run "npm run build"`).to.be.true;
        entry = fs.readFileSync(entryFile, 'utf8');
        manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
    });

    // vis-2 reads the federation manifest in visWidgetSetCompatibility.ts and skips the whole
    // widget set when react or react/jsx-runtime is missing from "shared": a set that bundles its
    // own JSX runtime stamps elements with a symbol react 19 rejects. Without these two entries
    // the widgets silently disappear from vis-2 instead of failing loudly.
    it('shares react and the JSX runtime with vis-2', () => {
        const shared = (manifest.shared || []).map(entry => entry.name);
        expect(shared).to.include('react');
        expect(shared).to.include('react/jsx-runtime');
    });

    it('names the remote entry that io-package.json points at', () => {
        expect(manifest.metaData.remoteEntry.name).to.equal(path.basename(widgetSet.url));
        expect(manifest.name).to.equal(widgetSet.name);
    });

    it('exposes every component registered in io-package.json', () => {
        const exposed = (manifest.exposes || []).map(e => e.name);
        widgetSet.components.forEach(component => expect(exposed).to.include(component));
        // i18n: 'component' makes vis-2 load the translations from the set itself
        expect(exposed).to.include('translations');
    });

    // The Vite 8 oxc minifier once defeated the placeholder replacement of the previous federation
    // plugin, which shipped a broken bundle in 0.4.12 - 0.4.14. Keep watching for leftovers.
    it('contains no unreplaced build placeholders', () => {
        expect(entry).to.not.contain('__v__css__');
        expect(entry).to.not.match(/__VITE_[A-Z_]*PLACEHOLDER__/);
    });

    it('ships the widget stylesheet', () => {
        const files = [
            entryFile,
            ...fs.readdirSync(path.join(widgetsDir, 'assets')).map(f => path.join(widgetsDir, 'assets', f)),
        ];
        const injects = files
            .filter(f => f.endsWith('.js'))
            .some(f => fs.readFileSync(f, 'utf8').includes('__vis2-tibber-css'));
        expect(injects, 'no bundle file injects the widget stylesheet').to.be.true;
    });

    it('does not ship build leftovers', () => {
        expect(fs.existsSync(path.join(widgetsDir, 'index.html')), 'index.html must not be published').to.be.false;
        expect(fs.existsSync(path.join(widgetsDir, 'mf-stats.json')), 'mf-stats.json must not be published').to.be
            .false;
    });
});
