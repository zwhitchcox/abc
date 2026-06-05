import { default as defaultConfig } from '@epic-web/config/eslint'

/** @type {import("eslint").Linter.Config} */
export default [
	{
		ignores: [
			'my-remix-app/**',
			'remix/**',
			'.playwright-mcp/**',
			'build/**',
			'server-build/**',
		],
	},
	...defaultConfig,
	// add custom config objects here:
	{
		files: ['**/tests/**/*.ts'],
		rules: { 'react-hooks/rules-of-hooks': 'off' },
	},
]
