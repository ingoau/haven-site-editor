import { base } from "$app/paths";
import { pathKey, type Path } from "../doc";
import { editor } from "../store.svelte";

/** Haven's schema message for exactly this field, if it has one. */
export function issueFor(path: Path): string | undefined {
  const key = pathKey(path);
  return editor.issues.find((issue) => pathKey(issue.path) === key)?.message;
}

/** How many problems sit at or under `path`. */
export function issuesUnder(path: Path): number {
  const key = pathKey(path);
  return editor.issues.filter((issue) => {
    const k = pathKey(issue.path);
    return k === key || k.startsWith(`${key}.`);
  }).length;
}

/** Haven's own pictures are `/images/...`; this site serves copies of them. */
export function assetUrl(src: string) {
  return src.startsWith("/") && !src.startsWith("//") ? `${base}${src}` : src;
}
