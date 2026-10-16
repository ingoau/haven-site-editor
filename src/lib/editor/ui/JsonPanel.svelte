<script lang="ts">
  import { pathKey } from "../doc";
  import { copyJson, exportJson, importText } from "../actions.svelte";
  import { DOCS_URL, FORM_URL } from "../sections";
  import { editor } from "../store.svelte";

  let editing = $state(false);
  let draft = $state("");

  const keys = $derived(Object.keys(editor.input));
</script>

<section class="submit">
  {#if editor.issues.length === 0}
    <p class="status status-ok">Valid. Haven's own checks pass on this document.</p>
  {:else}
    <p class="status status-bad">
      {editor.issues.length} problem{editor.issues.length === 1 ? "" : "s"} to fix first. Haven keeps
      your old page if the document is invalid.
    </p>
    <ul class="issues">
      {#each editor.issues as issue (pathKey(issue.path) + issue.message)}
        <li>
          <button type="button" class="link-button" onclick={() => (editor.selected = issue.path)}>
            {pathKey(issue.path) || "document"}
          </button>
          {issue.message}
        </li>
      {/each}
    </ul>
  {/if}

  <ol class="steps">
    <li>
      <span>Copy the JSON below.</span>
      <button type="button" class="btn" onclick={copyJson}>Copy JSON</button>
    </li>
    <li>
      <span>Open the Haven website form and paste it in.</span>
      <a class="btn btn-primary" href={FORM_URL} target="_blank" rel="noopener">Open the form</a>
    </li>
    <li><span>Your page picks it up within a couple of minutes.</span></li>
  </ol>
</section>

<div class="json-head">
  <span class="label">
    {#if keys.length}Changes from Haven's defaults: {keys.join(", ")}{:else}No changes yet, so this is just <code>{"{}"}</code>{/if}
  </span>
  <div class="json-actions">
    <button type="button" class="btn btn-small" onclick={exportJson}>Download</button>
    {#if editing}
      <button type="button" class="btn btn-small" onclick={() => (editing = false)}>Cancel</button>
      <button
        type="button"
        class="btn btn-small btn-primary"
        onclick={() => {
          if (importText(draft, "your JSON")) editing = false;
        }}>Apply</button
      >
    {:else}
      <button
        type="button"
        class="btn btn-small"
        onclick={() => {
          draft = editor.json;
          editing = true;
        }}>Edit JSON</button
      >
    {/if}
  </div>
</div>
{#if editing}
  <textarea class="json" bind:value={draft} spellcheck="false" aria-label="JSON document"></textarea>
{:else}
  <pre class="json" aria-label="JSON document">{editor.json}</pre>
{/if}
<p class="field-hint">
  Only what you changed is included: anything you include is frozen, and the rest keeps following the
  main Haven page. Field-by-field notes are in
  <a href={DOCS_URL} target="_blank" rel="noopener">SITE_DATA.md</a>.
</p>
