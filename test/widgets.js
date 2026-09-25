const fs = require('fs');
const path = require('path');
const { expect } = require('chai');

const widgetsDir = path.join(__dirname, '..', 'widgets', 'vis-2-widgets-tibberlink');
const entryFile = path.join(widgetsDir, 'customWidgets.js');

const EXPOSES = [
    './TibberCurrentPrice',
    './TibberCheapestWindow',
    './TibberLivePower',
    './TibberMonthlyCost',
    './translations',
];

describe('Built widget bundle', () => {
    let entry;

    before(() => {
        expect(fs.existsSync(entryFile), `${entryFile} is missing - run "npm run build"`).to.be.true;
        entry = fs.readFileSync(entryFile, 'utf8');
    });

    // Vite 8's default oxc minifier emits template literals, which defeats the quote-based
    // regex @originjs/vite-plugin-federation uses to replace these placeholders. The leftover
    // placeholder made VIS-2 fail to load every widget in v0.4.12 - v0.4.14, so guard it here.
    it('contains no unreplaced federation CSS placeholder', () => {
        expect(entry).to.not.contain('__v__css__');
    });

    it('contains no unreplaced Vite build placeholders', () => {
        expect(entry).to.not.match(/__VITE_[A-Z_]*PLACEHOLDER__/);
    });

    it('exposes every widget module', () => {
        EXPOSES.forEach(name => expect(entry).to.contain(`"${name}"`));
    });

    it('ships the widget stylesheet', () => {
        const css = fs
            .readdirSync(widgetsDir)
            .filter(f => f.endsWith('.js'))
            .some(f => fs.readFileSync(path.join(widgetsDir, f), 'utf8').includes('__vis2-tibber-css'));
        expect(css, 'no bundle file injects the widget stylesheet').to.be.true;
    });
});
