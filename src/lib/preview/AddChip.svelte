<script lang="ts">
  import type { Path } from "$lib/editor/doc";
  import { post, zone } from "./edit.svelte";

  interface Props {
    list: Path;
    kind: string;
    label: string;
    /** Current length, so a drop onto the chip lands at the end. */
    length?: number;
    /** Kind of the items dragged onto it, when it differs from `kind`. */
    dropKind?: string;
    class?: string;
  }

  let { list, kind, label, length = 0, dropKind, class: className = "" }: Props = $props();
</script>

<button
  type="button"
  data-ed-add
  class="ed-add {className}"
  onclick={(e) => {
    e.stopPropagation();
    post({ type: "add", list, kind });
  }}
  {@attach zone(list, length, dropKind ?? kind)}
>
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 3v10M3 8h10" /></svg>
  {label}
</button>
