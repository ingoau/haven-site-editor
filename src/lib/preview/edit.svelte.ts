import type { Attachment } from "svelte/attachments";
import { base } from "$app/paths";
import type { FromPreview } from "$lib/editor/bridge";
import { cityDefaults, pathKey, type EditorDoc, type Path } from "$lib/editor/doc";

/** What the editor last sent down; the page renders from this alone. */
export const preview = $state({
  doc: cityDefaults() as EditorDoc,
  eventName: "Your City",
  selected: null as Path | null,
  openFaq: false,
  showHidden: true,
  ready: false,
});

export function post(message: FromPreview) {
  window.parent?.postMessage(message, location.origin);
}

/** Haven's own pictures are `/images/...`; serve them from this site's base. */
export function asset(src: string | undefined) {
  if (!src) return "";
  return src.startsWith("/") && !src.startsWith("//") ? `${base}${src}` : src;
}

const isSelected = (path: Path) =>
  preview.selected !== null && pathKey(preview.selected) === pathKey(path);

type TextOptions = {
  /** Allow line breaks (Enter inserts one) instead of Enter finishing the edit. */
  multiline?: boolean;
  placeholder?: string;
  /** What to select when this text is clicked; defaults to the text itself. */
  select?: Path;
};

/**
 * Makes an element's text editable in place. Svelte never renders children
 * into it: the attachment owns the text, and leaves it alone while the caret is
 * inside so typing is never interrupted by the round trip through the editor.
 */
export function text(path: Path, value: string, opts: TextOptions = {}): Attachment<HTMLElement> {
  return (node) => {
    node.contentEditable = "plaintext-only";
    if (node.contentEditable !== "plaintext-only") node.contentEditable = "true";
    node.dataset.editable = "";
    node.dataset.path = pathKey(path);
    node.dataset.placeholder = opts.placeholder ?? "Type here";
    node.spellcheck = true;
    if (document.activeElement !== node && node.textContent !== value) node.textContent = value;
    node.classList.toggle("ed-selected-text", isSelected(path));

    const onInput = () => post({ type: "set", path, value: node.textContent ?? "" });
    const onKeydown = (e: KeyboardEvent) => {
      e.stopPropagation();
      if ((e.key === "Enter" && !opts.multiline) || e.key === "Escape") {
        e.preventDefault();
        node.blur();
      }
    };
    // Space and Enter on text inside a <summary> would otherwise toggle it.
    const onKeyup = (e: KeyboardEvent) => e.preventDefault();
    const onFocus = () => post({ type: "select", path: opts.select ?? path });
    const onBlur = () => {
      if (node.textContent !== value) node.textContent = value;
    };
    const onPaste = (e: ClipboardEvent) => {
      if (node.contentEditable === "plaintext-only") return;
      e.preventDefault();
      document.execCommand("insertText", false, e.clipboardData?.getData("text/plain") ?? "");
    };

    node.addEventListener("input", onInput);
    node.addEventListener("keydown", onKeydown);
    node.addEventListener("keyup", onKeyup);
    node.addEventListener("focus", onFocus);
    node.addEventListener("blur", onBlur);
    node.addEventListener("paste", onPaste);
    return () => {
      node.removeEventListener("input", onInput);
      node.removeEventListener("keydown", onKeydown);
      node.removeEventListener("keyup", onKeyup);
      node.removeEventListener("focus", onFocus);
      node.removeEventListener("blur", onBlur);
      node.removeEventListener("paste", onPaste);
    };
  };
}

/** Clicking selects `path` in the editor's side panel. */
export function pick(path: Path, label?: string): Attachment<HTMLElement> {
  return (node) => {
    node.dataset.pick = label ?? "";
    node.dataset.path = pathKey(path);
    node.classList.toggle("ed-selected", isSelected(path));
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("[data-ed-tools]")) return;
      e.stopPropagation();
      if (!(e.target as HTMLElement).closest("[data-editable]")) {
        post({ type: "select", path });
      }
    };
    node.addEventListener("click", onClick);
    return () => node.removeEventListener("click", onClick);
  };
}

let dragging: { list: Path; index: number; kind: string } | null = null;

type ItemOptions = {
  label?: string;
  /** Direction the list runs in, for deciding before/after on drop. */
  axis?: "x" | "y";
  /** Lists that items may be dragged between share a kind. */
  kind: string;
  /** Hide duplicate/delete, for lists that must keep their length. */
  fixed?: boolean;
  /** Where the toolbar sits. */
  tools?: "inside" | "outside";
};

const ICONS = {
  grip: '<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><circle cx="5" cy="3" r="1.4"/><circle cx="11" cy="3" r="1.4"/><circle cx="5" cy="8" r="1.4"/><circle cx="11" cy="8" r="1.4"/><circle cx="5" cy="13" r="1.4"/><circle cx="11" cy="13" r="1.4"/></svg>',
  copy: '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="5" width="9" height="9" rx="2"/><path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5"/></svg>',
  trash: '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4"/></svg>',
};

/**
 * One entry in a list: selectable, draggable by its grip, a drop target for
 * its siblings, and carrying duplicate and delete buttons.
 */
export function item(list: Path, index: number, opts: ItemOptions): Attachment<HTMLElement> {
  return (node) => {
    const path = [...list, index];
    const cleanupPick = pick(path, opts.label)(node);
    node.dataset.edItem = opts.tools ?? "inside";
    if (getComputedStyle(node).position === "static") node.style.position = "relative";

    const tools = document.createElement("div");
    tools.dataset.edTools = "";
    tools.className = "ed-tools";
    tools.contentEditable = "false";
    const name = document.createElement("span");
    name.className = "ed-tools-name";
    name.textContent = opts.label ?? "";
    // A span, not a button: Firefox won't start a drag from a button.
    const grip = document.createElement("span");
    grip.className = "ed-grip";
    grip.title = "Drag to reorder";
    grip.setAttribute("aria-label", `Drag ${opts.label ?? "item"} to reorder`);
    grip.innerHTML = ICONS.grip;
    grip.draggable = true;
    tools.append(grip, name);
    if (!opts.fixed) {
      const dup = document.createElement("button");
      dup.type = "button";
      dup.title = "Duplicate";
      dup.setAttribute("aria-label", `Duplicate ${opts.label ?? "item"}`);
      dup.innerHTML = ICONS.copy;
      dup.onclick = (e) => {
        e.stopPropagation();
        post({ type: "duplicate", list, index });
      };
      const del = document.createElement("button");
      del.type = "button";
      del.title = "Delete";
      del.className = "ed-danger";
      del.setAttribute("aria-label", `Delete ${opts.label ?? "item"}`);
      del.innerHTML = ICONS.trash;
      del.onclick = (e) => {
        e.stopPropagation();
        post({ type: "remove", list, index });
      };
      tools.append(dup, del);
    }
    node.append(tools);

    const onDragStart = (e: DragEvent) => {
      e.stopPropagation();
      dragging = { list, index, kind: opts.kind };
      e.dataTransfer?.setData("text/plain", pathKey(path));
      if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
      e.dataTransfer?.setDragImage(node, 16, 16);
      node.classList.add("ed-dragging");
      document.documentElement.classList.add("ed-is-dragging");
    };
    const onDragEnd = () => {
      dragging = null;
      node.classList.remove("ed-dragging");
      document.documentElement.classList.remove("ed-is-dragging");
      document.querySelectorAll("[data-drop]").forEach((el) => el.removeAttribute("data-drop"));
    };
    const side = (e: DragEvent) => {
      const rect = node.getBoundingClientRect();
      return opts.axis === "x"
        ? e.clientX > rect.left + rect.width / 2
        : e.clientY > rect.top + rect.height / 2;
    };
    const onDragOver = (e: DragEvent) => {
      if (!dragging || dragging.kind !== opts.kind) return;
      e.preventDefault();
      e.stopPropagation();
      node.dataset.drop = (side(e) ? "after-" : "before-") + (opts.axis ?? "y");
    };
    const onDragLeave = (e: DragEvent) => {
      if (!node.contains(e.relatedTarget as Node)) node.removeAttribute("data-drop");
    };
    const onDrop = (e: DragEvent) => {
      if (!dragging || dragging.kind !== opts.kind) return;
      e.preventDefault();
      e.stopPropagation();
      const toIndex = index + (side(e) ? 1 : 0);
      post({ type: "move", from: dragging.list, fromIndex: dragging.index, to: list, toIndex });
      onDragEnd();
    };

    grip.addEventListener("dragstart", onDragStart);
    grip.addEventListener("dragend", onDragEnd);
    node.addEventListener("dragover", onDragOver);
    node.addEventListener("dragleave", onDragLeave);
    node.addEventListener("drop", onDrop);
    return () => {
      cleanupPick?.();
      tools.remove();
      grip.removeEventListener("dragstart", onDragStart);
      grip.removeEventListener("dragend", onDragEnd);
      node.removeEventListener("dragover", onDragOver);
      node.removeEventListener("dragleave", onDragLeave);
      node.removeEventListener("drop", onDrop);
    };
  };
}

/** A container that accepts drops at the end of `list`, e.g. an empty day. */
export function zone(list: Path, length: number, kind: string): Attachment<HTMLElement> {
  return (node) => {
    const onDragOver = (e: DragEvent) => {
      if (!dragging || dragging.kind !== kind) return;
      e.preventDefault();
      node.dataset.dropZone = "";
    };
    const onDragLeave = (e: DragEvent) => {
      if (!node.contains(e.relatedTarget as Node)) delete node.dataset.dropZone;
    };
    const onDrop = (e: DragEvent) => {
      delete node.dataset.dropZone;
      if (!dragging || dragging.kind !== kind) return;
      e.preventDefault();
      post({ type: "move", from: dragging.list, fromIndex: dragging.index, to: list, toIndex: length });
    };
    node.addEventListener("dragover", onDragOver);
    node.addEventListener("dragleave", onDragLeave);
    node.addEventListener("drop", onDrop);
    return () => {
      node.removeEventListener("dragover", onDragOver);
      node.removeEventListener("dragleave", onDragLeave);
      node.removeEventListener("drop", onDrop);
    };
  };
}
