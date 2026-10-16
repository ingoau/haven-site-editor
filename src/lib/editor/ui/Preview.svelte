<script lang="ts">
  import { base } from "$app/paths";
  import type { FromPreview, ToPreview } from "../bridge";
  import { editor } from "../store.svelte";

  export type Viewport = "desktop" | "laptop" | "phone";

  interface Props {
    viewport: Viewport;
    /** Bumping `nonce` scrolls the preview to `section`. */
    scroll: { section: string; nonce: number };
  }

  let { viewport, scroll }: Props = $props();

  // The page is laid out at a real device width, then scaled to fit, so its
  // breakpoints and vw-based sizes behave exactly as they will on the site.
  const widths: Record<Viewport, number> = { desktop: 1440, laptop: 1024, phone: 390 };

  let frame: HTMLIFrameElement | undefined = $state();
  let boxWidth = $state(0);
  let boxHeight = $state(0);
  let ready = $state(false);

  const width = $derived(widths[viewport]);
  const pad = $derived(viewport === "phone" ? 48 : 32);
  const scale = $derived(Math.min(1, Math.max(0.2, (boxWidth - pad) / width)));
  const height = $derived(Math.max(400, (boxHeight - pad) / scale));

  function send(message: ToPreview) {
    frame?.contentWindow?.postMessage(message, location.origin);
  }

  function onMessage(e: MessageEvent<FromPreview>) {
    if (e.origin !== location.origin || e.source !== frame?.contentWindow) return;
    const msg = e.data;
    switch (msg?.type) {
      case "ready":
        ready = true;
        pushState();
        break;
      case "set":
        if (msg.path[0] === "$eventName") editor.eventName = String(msg.value);
        else editor.set(msg.path, msg.value);
        break;
      case "select":
        editor.selected = msg.path;
        break;
      case "move":
        editor.move(msg.from, msg.fromIndex, msg.to, msg.toIndex);
        break;
      case "remove":
        editor.remove(msg.list, msg.index);
        break;
      case "duplicate":
        editor.duplicate(msg.list, msg.index);
        break;
      case "add":
        editor.add(msg.list, msg.kind);
        break;
      case "history":
        if (msg.action === "undo") editor.undo();
        else editor.redo();
        break;
    }
  }

  function pushState() {
    send({
      type: "state",
      doc: $state.snapshot(editor.doc),
      eventName: editor.eventName,
      selected: $state.snapshot(editor.selected),
      openFaq: editor.openFaq,
      showHidden: editor.showHidden,
    });
  }

  $effect(() => {
    // Read everything the preview renders from, so this re-sends on any change.
    void [editor.doc, editor.eventName, editor.selected, editor.openFaq, editor.showHidden];
    if (ready) pushState();
  });

  $effect(() => {
    if (ready && editor.selected) send({ type: "reveal", path: $state.snapshot(editor.selected) });
  });

  $effect(() => {
    if (ready && scroll.nonce) send({ type: "scroll", target: scroll.section });
  });
</script>

<svelte:window onmessage={onMessage} />

<div class="stage-box" bind:clientWidth={boxWidth} bind:clientHeight={boxHeight}>
  <div
    class="device"
    class:device-phone={viewport === "phone"}
    style="width: {width * scale}px; height: {height * scale}px"
  >
    <iframe
      bind:this={frame}
      src="{base}/preview"
      title="Preview of your Haven page"
      style="width: {width}px; height: {height}px; zoom: {scale}"
    ></iframe>
  </div>
  <span class="scale-note">{width}px wide, shown at {Math.round(scale * 100)}%</span>
</div>
