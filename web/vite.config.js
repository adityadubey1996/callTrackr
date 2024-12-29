import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@/components": path.resolve(__dirname, "src/components"),
      "@/components/ui": path.resolve(__dirname, "src/components/ui"),
      "@/components/lib": path.resolve(__dirname, "src/components/lib"),
      "@/components/hooks": path.resolve(__dirname, "src/components/hooks"),
    },
  },
});
