import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/fit-planner/",
  root: "src",

  build: {
    outDir: "../dist",
    emptyOutDir: true,

    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),

        exercises: resolve(__dirname, "src/exercises/index.html"),

        nutrition: resolve(__dirname, "src/nutrition/index.html"),

        favorites: resolve(__dirname, "src/favorites/index.html"),

        planner: resolve(__dirname, "src/planner/index.html"),
      },
    },
  },
});