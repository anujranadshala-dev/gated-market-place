import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                browser: true,
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            'react': reactPlugin,
            'react-hooks': reactHooks,
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            ...tsPlugin.configs['recommended'].rules,
            ...reactPlugin.configs['recommended'].rules,
            ...reactHooks.configs['recommended'].rules,
            '@typescript-eslint/no-explicit-any': 'warn',
            'react/prop-types': 'off',
            'no-console': ['warn', { allow: ['warn', 'error'] }],
        },
    },
    {
        ignores: ['dist/**', 'node_modules/**'],
    },
];
