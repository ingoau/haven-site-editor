<script lang="ts" module>
  import type { Path } from "../doc";

  /** Shared between every list, so items can move between lists of a kind. */
  let dragging: { list: Path; index: number; kind: string } | null = null;
</script>

<script lang="ts" generics="T">
  import type { Snippet } from "svelte";
  import { isPrefix, pathKey } from "../doc";
  import { editor } from "../store.svelte";
  import { issuesUnder } from "./issues";

  interface Props {
    path: Path;
    /** Template name for new items, and which lists items may move between. */
    kind: string;
    label: string;
    noun: string;
    summary: (item: T, index: number) => string;
    body: Snippet<[Path, T, number]>;
    hint?: string;
    /** Lists sharing a group can trade items by drag; defaults to this list only. */
    group?: string;
    /** Note shown under the list, e.g. about the three painted-in spots. */
    note?: (count: number) => string | undefined;
  }

  let { path, kind, label, noun, summary, body, hint, group, note }: Props = $props();
  const dragGroup = $derived(group ?? pathKey(path));

  const items = $derived((editor.get(path) as T[] | undefined) ?? []);
  let open = $state<Record<number, boolean>>({});
  let dropAt = $state<{ index: number; after: boolean } | null>(null);

  // Opening the item that is selected in the preview.
  $effect(() => {
    const sel = editor.selected;
    if (!sel || !isPrefix(path, sel) || sel.length <= path.length) return;
    const index = sel[path.length] as number;
    if (!open[index]) open = { ...open, [index]: true };
  });

  const isSelected = (i: number) =>
    !!editor.selected && isPrefix([...path, i], editor.selected);

  function over(e: DragEvent, index: number) {
    if (!dragging || dragging.kind !== dragGroup) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    dropAt = { index, after: e.clientY > rect.top + rect.height / 2 };
  }

  function drop(e: DragEvent) {
    if (!dragging || dragging.kind !== dragGroup || !dropAt) return;
    e.preventDefault();
    e.stopPropagation();
    const to = dropAt.index + (dropAt.after ? 1 : 0);
    editor.move(dragging.list, dragging.index, path, to);
    dragging = null;
    dropAt = null;
  }
</script>

<div class="list-field" data-field={pathKey(path)}>
  <div class="list-head">
    <span class="label">{label}</span>
    <span class="count">{items.length}</span>
  </div>
  {#if hint}<p class="field-hint">{hint}</p>{/if}

  <ol
    class="list"
    ondragover={(e) => {
      if (dragging?.kind === dragGroup && items.length === 0) {
        e.preventDefault();
        dropAt = { index: 0, after: false };
      }
    }}
    ondrop={drop}
    ondragleave={(e) => {
      if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) dropAt = null;
    }}
  >
    {#each items as entry, i (i)}
      {@const problems = issuesUnder([...path, i])}
      <li
        class="row"
        class:row-open={open[i]}
        class:row-selected={isSelected(i)}
        class:drop-before={dropAt?.index === i && !dropAt.after}
        class:drop-after={dropAt?.index === i && dropAt.after}
        ondragover={(e) => over(e, i)}
        ondrop={drop}
      >
        <div class="row-head">
          <button
            type="button"
            class="grip"
            draggable="true"
            aria-label="Drag {noun} {i + 1} to reorder"
            title="Drag to reorder"
            ondragstart={(e) => {
              dragging = { list: path, index: i, kind: dragGroup };
              e.dataTransfer?.setData("text/plain", String(i));
              if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
              const row = (e.currentTarget as HTMLElement).closest("li");
              if (row) e.dataTransfer?.setDragImage(row, 12, 12);
            }}
            ondragend={() => {
              dragging = null;
              dropAt = null;
            }}
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true"><circle cx="5" cy="3" r="1.4" /><circle cx="11" cy="3" r="1.4" /><circle cx="5" cy="8" r="1.4" /><circle cx="11" cy="8" r="1.4" /><circle cx="5" cy="13" r="1.4" /><circle cx="11" cy="13" r="1.4" /></svg>
          </button>
          <button
            type="button"
            class="row-title"
            aria-expanded={!!open[i]}
            onclick={() => {
              open = { ...open, [i]: !open[i] };
              editor.selected = [...path, i];
            }}
          >
            <span class="row-text">{summary(entry, i) || `Untitled ${noun}`}</span>
            {#if problems}<span class="badge-bad" title="{problems} problem(s)">{problems}</span>{/if}
          </button>
          <button
            type="button"
            class="icon"
            title="Duplicate"
            aria-label="Duplicate {noun} {i + 1}"
            onclick={() => editor.duplicate(path, i)}
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="5" y="5" width="9" height="9" rx="2" /><path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" /></svg>
          </button>
          <button
            type="button"
            class="icon icon-danger"
            title="Delete"
            aria-label="Delete {noun} {i + 1}"
            onclick={() => editor.remove(path, i)}
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4" /></svg>
          </button>
        </div>
        {#if open[i]}
          <div class="row-body">
            {@render body([...path, i], entry, i)}
          </div>
        {/if}
      </li>
    {/each}
  </ol>
  {#if note?.(items.length)}<p class="field-hint">{note(items.length)}</p>{/if}
  <button type="button" class="add" onclick={() => editor.add(path, kind)}>
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 3v10M3 8h10" /></svg>
    Add {noun}
  </button>
</div>
