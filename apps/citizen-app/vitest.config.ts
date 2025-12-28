import { reactConfig } from "@repo/vitest-config/react";
import { defineConfig, mergeConfig } from "vitest/config";

export default mergeConfig(
	reactConfig,
	defineConfig({
		resolve: {
			alias: {
				"@": "./src",
			},
		},
	}),
);
