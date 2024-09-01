import react from "@vitejs/plugin-react"
import path from "path"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  return {
    define: {
      "process.env.PUBLIC_URL": JSON.stringify(env.PUBLIC_URL || ""),
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: "dist",
      rollupOptions: {
        onwarn(warning, warn) {
          // Ignore certain warnings
          if (warning.code === "DEPRECATED") return

          // Use default for everything else
          warn(warning)
        },
      },
    },
    logLevel: "error", // Only show errors, not warnings
  }
})
