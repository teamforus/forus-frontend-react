const js = require('@eslint/js');
const globals = require('globals');
const tseslint = require('typescript-eslint');
const reactPlugin = require('eslint-plugin-react');
const reactHooksPlugin = require('eslint-plugin-react-hooks');
const prettierPlugin = require('eslint-plugin-prettier');
const prettierConfig = require('eslint-config-prettier');

module.exports = [
    {
        ignores: [
            'dist',
            'eslint.config.cjs',
            '.prettierrc.cjs',
            'webpack.config.mjs',
            'custom.d.ts',
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.{js,mjs,ts,tsx}'],
        plugins: {
            react: reactPlugin,
            'react-hooks': reactHooksPlugin,
            prettier: prettierPlugin,
        },
        languageOptions: {
            parserOptions: {
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2022,
            },
        },
        settings: {
            react: { version: 'detect' },
        },
        rules: {
            ...reactPlugin.configs.recommended.rules,
            ...prettierConfig.rules,
            'prettier/prettier': 'error',
            '@typescript-eslint/no-unused-vars': ['error', { varsIgnorePattern: '^React$', argsIgnorePattern: '^_', caughtErrors: 'none' }],
            '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
            'no-redeclare': 'off',
            // 'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
        },
    },
];
