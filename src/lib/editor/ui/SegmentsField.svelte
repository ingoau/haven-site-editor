<script lang="ts">
  import { pathKey, type Path } from "../doc";
  import { editor } from "../store.svelte";
  import { issueFor } from "./issues";

  /**
   * Copy written as pieces, so part of a sentence can be highlighted (`marked`)
   * or a link (`linked`). Pieces are joined exactly as written, spaces and all.
   */
  interface Props {
    path: Path;
    label: string;
    variant: "marked" | "linked";
    hint?: string;
  }

  let { path, label, variant, hint }: Props = $props();

  type Seg = { text: string; mark?: boolean; href?: string };
  const segs = $derived((editor.get(path) as Seg[] | undefined) ?? []);
  let from = $state<number | null>(null);
  let dropAt = $state<number | null>(null);

  function update(i: number, patch: Partial<Seg>) {
    const next = { ...segs[i], ...patch };
    if (next.mark === false) delete next.mark;
    if (next.href === undefined) delete next.href;
    editor.set([...path, i], next);
  }
</script>

<div class="field" data-field={pathKey(path)}>
  <span class="label">{label}</span>
  <p class="seg-preview" aria-label="How it reads">
    {#each segs as seg, i (i)}{#if seg.mark}<mark>{seg.text}</mark>{:else if seg.href !== undefined}<u>{seg.text}</u>{:else}{seg.text}{/if}{/each}
  </p>
  <ol class="segs">
    {#each segs as seg, i (i)}
      {@const hrefIssue = issueFor([...path, i, "href"])}
      <li
        class="seg"
        class:drop-before={dropAt === i}
        class:drop-after={dropAt === i + 1 && i === segs.length - 1}
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
      >
        <div class="seg-row">
          <button
            type="button"
            class="grip"
            draggable="true"
            aria-label="Drag piece {i + 1} to reorder"
            ondragstart={(e) => {
              from = i;
              e.dataTransfer?.setData("text/plain", String(i));
            }}
            ondragend={() => (from = dropAt = null)}
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true"><circle cx="5" cy="3" r="1.4" /><circle cx="11" cy="3" r="1.4" /><circle cx="5" cy="8" r="1.4" /><circle cx="11" cy="8" r="1.4" /><circle cx="5" cy="13" r="1.4" /><circle cx="11" cy="13" r="1.4" /></svg>
          </button>
          <textarea
            rows="1"
            value={seg.text}
            aria-label="Piece {i + 1}"
            oninput={(e) => update(i, { text: e.currentTarget.value })}
            onfocus={() => (editor.selected = path)}
          ></textarea>
          {#if variant === "marked"}
            <button
              type="button"
              class="toggle"
              aria-pressed={!!seg.mark}
              title="Highlight with the marker pen"
              onclick={() => update(i, { mark: !seg.mark })}>Highlight</button
            >
          {:else}
            <button
              type="button"
              class="toggle"
              aria-pressed={seg.href !== undefined}
              title="Make this piece a link"
              onclick={() => update(i, { href: seg.href === undefined ? "https://" : undefined })}
              >Link</button
            >
          {/if}
          <button
            type="button"
            class="icon icon-danger"
            aria-label="Delete piece {i + 1}"
            title="Delete"
            onclick={() => editor.remove(path, i)}
          >
            <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4" /></svg>
          </button>
        </div>
        {#if variant === "linked" && seg.href !== undefined}
          <input
            class="seg-href"
            type="text"
            inputmode="url"
            value={seg.href}
            placeholder="https:// or mailto:"
            aria-label="Link for piece {i + 1}"
            aria-invalid={!!hrefIssue}
            spellcheck="false"
            oninput={(e) => update(i, { href: e.currentTarget.value })}
          />
          {#if hrefIssue}<p class="field-error">{hrefIssue}</p>{/if}
        {/if}
      </li>
    {/each}
  </ol>
  <button type="button" class="add add-small" onclick={() => editor.add(path, variant)}>
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 3v10M3 8h10" /></svg>
    Add piece
  </button>
  {#if hint}<p class="field-hint">{hint}</p>{/if}
</div>
