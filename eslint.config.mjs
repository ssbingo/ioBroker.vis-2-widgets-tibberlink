import config from '@iobroker/eslint-config';

export default [
    ...config,
    {
        ignores: ['admin/', 'src-widgets/', 'widgets/', 'node_modules/'],
    },
    {
        // Mocha globals for the test suite
        files: ['test/**/*.js'],
        languageOptions: {
            globals: {
                describe: 'readonly',
                it: 'readonly',
                before: 'readonly',
                after: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
            },
        },
    },
];
