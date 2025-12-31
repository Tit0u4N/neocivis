import { defineConfig } from "vitest/config";

export const reactConfig = defineConfig({
	test: {
		globals: true,
		environment: "jsdom",
		include: ["src/**/*.{test,spec}.{ts,tsx}"],
		exclude: ["node_modules", "dist", ".next"],
	},
});
