import config from '@iobroker/eslint-config';

export default [
    ...config,
    {
        ignores: ['admin/', 'src-widgets/', 'widgets/', 'node_modules/'],
    },
];
