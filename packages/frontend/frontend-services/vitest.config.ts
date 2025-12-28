import { nodeConfig } from "@repo/vitest-config/node";
import { defineConfig, mergeConfig } from "vitest/config";

export default mergeConfig(nodeConfig, defineConfig({}));
