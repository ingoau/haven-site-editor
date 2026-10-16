<script lang="ts">
  import { pathKey, type Path } from "../doc";
  import { editor } from "../store.svelte";

  /** A short list of single lines of text, reorderable by drag. */
  interface Props {
    path: Path;
    label: string;
    hint?: string;
    placeholder?: string;
  }

  let { path, label, hint, placeholder = "A line" }: Props = $props();

  const lines = $derived((editor.get(path) as string[] | undefined) ?? []);
  let from = $state<number | null>(null);
  let dropAt = $state<number | null>(null);
</script>

<div class="field" data-field={pathKey(path)}>
  <span class="label">{label}</span>
  <ol class="lines">
    {#each lines as line, i (i)}
      <li
        class:drop-before={dropAt === i}
        ondragover={(e) => {
          if (from === null) return;
          e.preventDefault();
          const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
          dropAt = e.clientY > rect.top + rect.height / 2 ? i + 1 : i;
        }}
        ondrop={(e) => {
          if (from === null || dropAt === null) return;
          e.preventDefault();
          editor.move(path, from, path, dropAt);
          from = dropAt = null;
        }}
        class:drop-after={dropAt === i + 1 && i === lines.length - 1}
      >
        <button
          type="button"
          class="grip"
          draggable="true"
          aria-label="Drag line {i + 1} to reorder"
          ondragstart={(e) => {
            from = i;
            e.dataTransfer?.setData("text/plain", String(i));
          }}
          ondragend={() => (from = dropAt = null)}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true"><circle cx="5" cy="3" r="1.4" /><circle cx="11" cy="3" r="1.4" /><circle cx="5" cy="8" r="1.4" /><circle cx="11" cy="8" r="1.4" /><circle cx="5" cy="13" r="1.4" /><circle cx="11" cy="13" r="1.4" /></svg>
        </button>
        <input
          type="text"
          value={line}
          {placeholder}
          aria-label="{label}, line {i + 1}"
          oninput={(e) => editor.set([...path, i], e.currentTarget.value)}
          onfocus={() => (editor.selected = [...path, i])}
        />
        <button
          type="button"
          class="icon icon-danger"
          aria-label="Delete line {i + 1}"
          title="Delete"
          onclick={() => editor.remove(path, i)}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4" /></svg>
        </button>
      </li>
    {/each}
  </ol>
  <button type="button" class="add add-small" onclick={() => editor.add(path, "line")}>
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 3v10M3 8h10" /></svg>
    Add line
  </button>
  {#if hint}<p class="field-hint">{hint}</p>{/if}
</div>
