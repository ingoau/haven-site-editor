import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({
      preprocess: vitePreprocess(),
      compilerOptions: {
        // Editable text is filled in at runtime, so headings and links look empty
        // to the compiler.
        warningFilter: (w) =>
          !["a11y_missing_content", "a11y_consider_explicit_label"].includes(w.code),
      },
      adapter: adapter({ fallback: "404.html" }),
      // SvelteKit 3 dropped the built-in $lib alias; keep it for existing imports.
      alias: { $lib: "src/lib" },
      // GitHub Pages serves the site from /<repo>, set by the deploy workflow.
      paths: { base: (process.env.BASE_PATH ?? "") as "" | `/${string}`, relative: false },
    }),
  ],
});
