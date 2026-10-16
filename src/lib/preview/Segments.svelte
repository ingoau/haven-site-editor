<script lang="ts">
  import type { Path } from "$lib/editor/doc";
  import { text } from "./edit.svelte";

  /**
   * A run of copy made of pieces: some highlighted with the marker pen, some
   * links. Each piece is edited in place; splitting, marking and linking happen
   * in the side panel, which this selects.
   */
  interface Props {
    path: Path;
    segments: { text: string; mark?: boolean; href?: string }[];
    linkClass?: string;
    /** What clicking selects in the side panel. */
    select: Path;
  }

  let { path, segments, linkClass = "underline", select }: Props = $props();
</script>

{#each segments as seg, i (i)}{#if seg.mark}<span
      class="marker"
      {@attach text([...path, i, "text"], seg.text, { select })}
    ></span>{:else if seg.href}<a
      class={linkClass}
      href={seg.href}
      {@attach text([...path, i, "text"], seg.text, { select })}
    ></a>{:else}<span {@attach text([...path, i, "text"], seg.text, { select })}></span>{/if}{/each}
