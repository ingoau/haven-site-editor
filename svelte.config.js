import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({ fallback: "404.html" }),
    // GitHub Pages serves the site from /<repo>, set by the deploy workflow.
    paths: { base: process.env.BASE_PATH ?? "", relative: false },
  },
};
