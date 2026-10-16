import { parseImport } from "./doc";
import { editor } from "./store.svelte";

export const toast = $state({ message: "", tone: "ok" as "ok" | "bad", id: 0 });

export function notify(message: string, tone: "ok" | "bad" = "ok") {
  toast.message = message;
  toast.tone = tone;
  toast.id++;
}

export async function copyJson() {
  try {
    await navigator.clipboard.writeText(editor.json);
    notify("Copied the JSON. Paste it into the form.");
    return true;
  } catch {
    notify("Couldn't reach the clipboard. Select the JSON and copy it instead.", "bad");
    return false;
  }
}

function slug(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "city";
}

export function exportJson() {
  const blob = new Blob([editor.json + "\n"], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `haven-${slug(editor.eventName)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  notify(`Exported ${a.download}.`);
}

export function importText(text: string, source = "the file") {
  const result = parseImport(text);
  if (!result.ok) {
    notify(`Couldn't import ${source}. ${result.error}`, "bad");
    return false;
  }
  editor.replace(result.file.doc, result.file.eventName);
  notify(`Imported ${source}. Undo brings back what you had.`);
  return true;
}

export async function importFile(file: File) {
  importText(await file.text(), file.name);
}
