<script lang="ts">
  import "$lib/editor/ui/editor.css";
  import { base } from "$app/paths";
  import { onMount, untrack } from "svelte";
  import { editor } from "$lib/editor/store.svelte";
  import { exportJson, importFile, toast, copyJson } from "$lib/editor/actions.svelte";
  import { FORM_URL, REPO_URL, keysFor, sectionFor, sections, type SectionId } from "$lib/editor/sections";
  import { issuesUnder } from "$lib/editor/ui/issues";
  import Preview, { type Viewport } from "$lib/editor/ui/Preview.svelte";
  import SectionForm from "$lib/editor/ui/SectionForm.svelte";

  let section = $state<SectionId>("hero");
  let viewport = $state<Viewport>("desktop");
  let scroll = $state({ section: "hero", nonce: 0 });
  let fileInput: HTMLInputElement | undefined = $state();
  let formEl: HTMLElement | undefined = $state();
  let dropping = $state(false);
  let now = $state(Date.now());
  let notice: HTMLDialogElement | undefined = $state();

  const NOTICE_KEY = "haven-editor:unofficial-notice";
  const HELP_URL = "https://hackclub.enterprise.slack.com/team/U0923H02Y3B";

  function dismissNotice() {
    try {
      localStorage.setItem(NOTICE_KEY, "1");
    } catch {}
  }

  onMount(() => {
    editor.init();
    try {
      if (!localStorage.getItem(NOTICE_KEY)) notice?.showModal();
    } catch {
      notice?.showModal();
    }
    const tick = setInterval(() => (now = Date.now()), 15000);
    return () => clearInterval(tick);
  });

  // Save a moment after the last change, so typing isn't a write per key.
  $effect(() => {
    void [editor.doc, editor.eventName];
    if (!editor.loaded) return;
    const t = setTimeout(() => editor.persist(), 300);
    return () => clearTimeout(t);
  });

  // Selecting something in the preview opens its section and field.
  $effect(() => {
    const sel = editor.selected;
    if (!sel) return;
    const target = sectionFor(sel);
    untrack(() => {
      if (target !== section && section !== "json") section = target;
    });
    requestAnimationFrame(() => {
      if (!formEl) return;
      for (let n = sel.length; n > 0; n--) {
        const el = formEl.querySelector<HTMLElement>(`[data-field="${CSS.escape(sel.slice(0, n).join("."))}"]`);
        if (!el) continue;
        if (el.contains(document.activeElement)) break;
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        el.classList.remove("flash");
        void el.offsetWidth;
        el.classList.add("flash");
        break;
      }
    });
  });

  function openSection(id: SectionId) {
    section = id;
    formEl?.scrollTo({ top: 0 });
    const target = sections.find((s) => s.id === id)?.preview;
    if (target) scroll = { section: target, nonce: scroll.nonce + 1 };
  }

  function problems(id: SectionId) {
    return keysFor(id).reduce((n, key) => n + issuesUnder([key]), 0);
  }

  function onKeydown(e: KeyboardEvent) {
    if (!(e.metaKey || e.ctrlKey)) return;
    const tag = (e.target as HTMLElement).tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    const key = e.key.toLowerCase();
    if (key === "z" && !e.shiftKey) {
      e.preventDefault();
      editor.undo();
    } else if (key === "y" || (key === "z" && e.shiftKey)) {
      e.preventDefault();
      editor.redo();
    }
  }

  const savedLabel = $derived.by(() => {
    if (!editor.savedAt) return "Not saved yet";
    const s = Math.round((now - editor.savedAt.getTime()) / 1000);
    if (s < 60) return "Saved in this browser";
    const m = Math.round(s / 60);
    return m < 60 ? `Saved ${m} min ago` : `Saved ${editor.savedAt.toLocaleString()}`;
  });

  const current = $derived(sections.find((s) => s.id === section)!);

  let toastVisible = $state(false);
  $effect(() => {
    if (!toast.id) return;
    toastVisible = true;
    const t = setTimeout(() => (toastVisible = false), toast.tone === "bad" ? 9000 : 3500);
    return () => clearTimeout(t);
  });
</script>

<svelte:head>
  <title>Haven site editor</title>
  <meta name="description" content="Edit your Hack Club Haven city page visually, then submit the JSON." />
</svelte:head>

<svelte:window
  onkeydown={onKeydown}
  ondragover={(e) => {
    if (e.dataTransfer?.types.includes("Files")) {
      e.preventDefault();
      dropping = true;
    }
  }}
  ondragleave={(e) => {
    if (!e.relatedTarget) dropping = false;
  }}
  ondrop={(e) => {
    const file = e.dataTransfer?.files[0];
    dropping = false;
    if (!file) return;
    e.preventDefault();
    importFile(file);
  }}
/>

<div class="app">
  <header class="bar">
    <a class="brand" href="{base}/" aria-label="Haven site editor">
      <img src="{base}/images/logo.webp" alt="" width="778" height="445" />
      <span>site editor</span>
    </a>

    <div class="bar-group" role="group" aria-label="History">
      <button type="button" class="tool" disabled={!editor.canUndo} onclick={() => editor.undo()} title="Undo (Ctrl+Z)">
        <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 5 3 9l4 4" /><path d="M3 9h9a5 5 0 0 1 0 10h-2" /></svg>
        <span class="sr-only">Undo</span>
      </button>
      <button type="button" class="tool" disabled={!editor.canRedo} onclick={() => editor.redo()} title="Redo (Ctrl+Shift+Z)">
        <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m13 5 4 4-4 4" /><path d="M17 9H8a5 5 0 0 0 0 10h2" /></svg>
        <span class="sr-only">Redo</span>
      </button>
    </div>

    <div class="viewports" role="radiogroup" aria-label="Preview width">
      {#each [["desktop", "Desktop"], ["laptop", "Tablet"], ["phone", "Phone"]] as [id, label] (id)}
        <button
          type="button"
          role="radio"
          aria-checked={viewport === id}
          onclick={() => (viewport = id as Viewport)}
        >
          {#if id === "desktop"}
            <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="2" y="3.5" width="16" height="10.5" rx="1.5" /><path d="M7 17h6M10 14v3" /></svg>
          {:else if id === "laptop"}
            <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="4" y="2" width="12" height="16" rx="2" /><path d="M9 15.5h2" /></svg>
          {:else}
            <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="6" y="2" width="8" height="16" rx="2" /><path d="M9.25 15.5h1.5" /></svg>
          {/if}
          <span>{label}</span>
        </button>
      {/each}
    </div>

    <label class="check bar-check" title="Show parts the live page hides, like an empty sponsors section">
      <input type="checkbox" bind:checked={editor.showHidden} />
      Show hidden parts
    </label>

    <div class="bar-end">
      <input
        bind:this={fileInput}
        type="file"
        accept="application/json,.json"
        class="sr-only"
        tabindex="-1"
        onchange={(e) => {
          const file = e.currentTarget.files?.[0];
          if (file) importFile(file);
          e.currentTarget.value = "";
        }}
      />
      <a
        class="tool"
        href={REPO_URL}
        target="_blank"
        rel="noopener"
        title="Source code on GitHub"
      >
        <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z" /></svg>
        <span class="sr-only">Source code on GitHub</span>
      </a>
      <button type="button" class="btn btn-dark" onclick={() => fileInput?.click()}>Import</button>
      <button type="button" class="btn btn-dark" onclick={exportJson}>Export</button>
      <button
        type="button"
        class="btn btn-dark"
        class:has-issues={editor.issues.length > 0}
        onclick={() => openSection("json")}
      >
        {#if editor.issues.length}
          {editor.issues.length} problem{editor.issues.length === 1 ? "" : "s"}
        {:else}
          JSON
        {/if}
      </button>
      <a
        class="btn btn-primary"
        href={FORM_URL}
        target="_blank"
        rel="noopener"
        onclick={() => copyJson()}
        title="Copies your JSON, then opens the Haven website form"
      >
        Copy &amp; submit
      </a>
    </div>
  </header>

  <aside class="panel" aria-label="Page sections">
    <nav class="rail">
      <ul>
        {#each sections as s (s.id)}
          {@const n = problems(s.id)}
          <li>
            <button type="button" aria-current={section === s.id ? "page" : undefined} onclick={() => openSection(s.id)}>
              <span>{s.label}</span>
              {#if n}<span class="badge-bad">{n}</span>{/if}
            </button>
          </li>
        {/each}
      </ul>
      <div class="rail-foot">
        <p class="saved">{savedLabel}</p>
        <button
          type="button"
          class="link-button"
          onclick={() => {
            if (confirm("Put the whole page back to Haven's defaults? You can undo this.")) editor.reset();
          }}
        >
          Start over
        </button>
        <p class="source">
          <a href={REPO_URL} target="_blank" rel="noopener">Source on GitHub</a>, free under the
          <a href="{REPO_URL}/blob/main/LICENSE" target="_blank" rel="noopener">AGPLv3</a>
        </p>
      </div>
    </nav>

    <div class="form" bind:this={formEl}>
      <div class="form-head">
        <h1>{current.label}</h1>
        {#if current.reset && section !== "page"}
          <button
            type="button"
            class="link-button"
            onclick={() => {
              for (const key of current.reset ?? []) editor.reset(key as never);
            }}
          >
            Reset to Haven's
          </button>
        {/if}
      </div>
      {#if editor.loaded}
        <SectionForm {section} />
      {/if}
    </div>
  </aside>

  <main class="canvas" aria-label="Preview">
    <Preview {viewport} {scroll} />
    <p class="canvas-tip">
      Click any text on the page to edit it. Hover a block for its drag handle.
    </p>
  </main>

  {#if dropping}
    <div class="dropping" aria-hidden="true">Drop a .json file to import it</div>
  {/if}

  <dialog class="notice" bind:this={notice} aria-labelledby="notice-title" onclose={dismissNotice}>
    <h2 id="notice-title">This editor is unofficial</h2>
    <p>
      It isn't made or supported by Hack Club or the Haven organisers. If you need help with it, message
      <a href={HELP_URL} target="_blank" rel="noopener">@inw on the Hack Club Slack</a>, not the Haven orgs team.
    </p>
    <form method="dialog">
      <button class="btn btn-primary">Got it</button>
    </form>
  </dialog>

  <div class="toast" class:toast-show={toastVisible} class:toast-bad={toast.tone === "bad"} role="status" aria-live="polite">
    {toast.message}
  </div>
</div>
