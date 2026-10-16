<script lang="ts">
  import { pathKey, type Path } from "../doc";
  import { editor } from "../store.svelte";
  import { assetUrl, issueFor } from "./issues";

  interface Props {
    path: Path;
    label: string;
    hint?: string;
    multiline?: boolean;
    placeholder?: string;
    kind?: "text" | "url" | "image";
  }

  let { path, label, hint, multiline = false, placeholder, kind = "text" }: Props = $props();

  const id = $derived(`f-${pathKey(path)}`);
  const value = $derived((editor.get(path) as string | undefined) ?? "");
  const issue = $derived(issueFor(path));
  const selected = $derived(editor.selected && pathKey(editor.selected) === pathKey(path));

  function onInput(e: Event) {
    editor.set(path, (e.currentTarget as HTMLInputElement).value);
  }
</script>

<div class="field" class:field-selected={selected} data-field={pathKey(path)}>
  <label for={id}>{label}</label>
  {#if kind === "image"}
    <div class="image-row">
      <img src={assetUrl(value)} alt="" class="thumb" />
      <input
        {id}
        type="text"
        inputmode="url"
        {value}
        {placeholder}
        oninput={onInput}
        onfocus={() => (editor.selected = path)}
        aria-invalid={!!issue}
        spellcheck="false"
      />
    </div>
  {:else if multiline}
    <textarea
      {id}
      {value}
      {placeholder}
      rows="3"
      oninput={onInput}
      onfocus={() => (editor.selected = path)}
      aria-invalid={!!issue}
    ></textarea>
  {:else}
    <input
      {id}
      type="text"
      inputmode={kind === "url" ? "url" : "text"}
      {value}
      {placeholder}
      oninput={onInput}
      onfocus={() => (editor.selected = path)}
      aria-invalid={!!issue}
      spellcheck={kind === "text"}
    />
  {/if}
  {#if issue}
    <p class="field-error">{issue}</p>
  {:else if hint}
    <p class="field-hint">{hint}</p>
  {/if}
</div>
