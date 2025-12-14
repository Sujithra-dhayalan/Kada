import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'jsdom',
		globals: true,
		include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
		setupFiles: './src/setupTests.js',
	},
});
