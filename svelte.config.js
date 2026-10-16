import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default {
  preprocess: vitePreprocess(),
  compilerOptions: {
    // Editable text is filled in at runtime, so headings and links look empty
    // to the compiler.
    warningFilter: (w) =>
      !["a11y_missing_content", "a11y_consider_explicit_label"].includes(w.code),
  },
  kit: {
    adapter: adapter({ fallback: "404.html" }),
    // GitHub Pages serves the site from /<repo>, set by the deploy workflow.
    paths: { base: process.env.BASE_PATH ?? "", relative: false },
  },
};
