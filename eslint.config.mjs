import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import * as ProduckEslint from '@produck/eslint-rules';

export default defineConfig([
	{
		files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
		plugins: { js },
		extends: ['js/recommended'],
		languageOptions: { globals: { ...globals.browser } },
	},
	tseslint.configs.recommended,
	ProduckEslint.config,
	ProduckEslint.excludeGitIgnore(import.meta.url),
	{
		linterOptions: {
			noInlineConfig: false,
		},
	},
]);
