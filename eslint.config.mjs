import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';
import * as ProduckEslint from '@produck/eslint-rules';

export default defineConfig([
	{ files: ['**/*.{js,mjs,cjs,ts,mts,cts}'], plugins: { js }, extends: ['js/recommended'] },
	tseslint.configs.recommended,
	ProduckEslint.config,
	ProduckEslint.excludeGitIgnore(import.meta.url),
]);
