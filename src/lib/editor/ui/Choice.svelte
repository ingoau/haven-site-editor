<script lang="ts">
  import type { Path } from "../doc";
  import { editor } from "../store.svelte";

  interface Props {
    path: Path;
    label: string;
    options: { value: string; label: string }[];
    hint?: string;
  }

  let { path, label, options, hint }: Props = $props();
  const value = $derived((editor.get(path) as string | undefined) ?? "");
</script>

<div class="field">
  <span class="label" id="choice-{path.join('-')}">{label}</span>
  <div class="choice" role="radiogroup" aria-labelledby="choice-{path.join('-')}">
    {#each options as option (option.value)}
      <button
        type="button"
        role="radio"
        aria-checked={value === option.value}
        onclick={() => editor.set(path, option.value)}>{option.label}</button
      >
    {/each}
  </div>
  {#if hint}<p class="field-hint">{hint}</p>{/if}
</div>
