<script lang="ts">
  import { editor } from "../store.svelte";
  import { assetUrl } from "./issues";

  const title = $derived(editor.doc.meta.title.trim() || `Haven — ${editor.eventName}`);
</script>

<!-- Roughly how Slack and iMessage unfurl the link. -->
<div class="share" aria-label="Link preview">
  <img src={assetUrl(editor.doc.meta.image)} alt="" />
  <div class="share-text">
    <span class="share-host">haven.hackclub.com</span>
    <strong>{title}</strong>
    <span>{editor.doc.meta.description}</span>
  </div>
</div>
