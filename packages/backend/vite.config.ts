import { defineConfig } from "vite"
import { readdirSync } from "fs"
import { resolve } from "path"

const folderPath = resolve(__dirname, "src/lambdas")
const lambdaFiles = readdirSync(folderPath)
    .filter(f => f.endsWith(".ts"))
    .reduce((entries, file) => {
        const name = file.replace(/\.ts$/, "")
        entries[name] = folderPath + "/" + file
        return entries
    }, {} as Record<string, string>)

export default defineConfig({
    build: {
        target: "es2022",
        outDir: "dist",
        lib: {
            entry: lambdaFiles,
            formats: ['cjs'],
        },
        rollupOptions: {
            output: {
                entryFileNames: "[name].js",
                chunkFileNames: "lib/[name].js",
                assetFileNames: "lib/[name][extname]"
            }
        }
    }
})
