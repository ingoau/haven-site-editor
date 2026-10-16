<script lang="ts">
  import "$lib/preview/preview.css";
  import { cssUrl, imageKeys, type SiteImages } from "$lib/data/images";
  import { fontRoles, type SiteFonts } from "$lib/data/fonts";
  import type { ToPreview } from "$lib/editor/bridge";
  import { asset, post, preview } from "$lib/preview/edit.svelte";
  import Fonts from "$lib/haven/Fonts.svelte";
  import SiteHeader from "$lib/haven/SiteHeader.svelte";
  import Hero from "$lib/haven/Hero.svelte";
  import About from "$lib/haven/About.svelte";
  import Pitch from "$lib/haven/Pitch.svelte";
  import Steps from "$lib/haven/Steps.svelte";
  import Schedule from "$lib/haven/Schedule.svelte";
  import PastEvents from "$lib/haven/PastEvents.svelte";
  import Sponsors from "$lib/haven/Sponsors.svelte";
  import Faq from "$lib/haven/Faq.svelte";
  import SiteFooter from "$lib/haven/SiteFooter.svelte";

  const site = $derived(preview.doc);

  // Every picture goes through `asset` once here, so the components can keep
  // using the names exactly as Haven's do.
  const images = $derived(
    Object.fromEntries(
      imageKeys.map((key) => [key, asset(site.images[key])]),
    ) as SiteImages,
  );

  const fonts = $derived.by(() => {
    const out: SiteFonts = {};
    for (const role of fontRoles) {
      const font = site.fonts[role];
      if (font?.family.trim()) {
        out[role] = font.src?.trim()
          ? { family: font.family.trim(), src: font.src.trim() }
          : { family: font.family.trim() };
      }
    }
    return out;
  });

  const middleStage = $derived(
    `--stage-bg: ${cssUrl(images.stageMiddle)}; --stage-bg-mobile: ${cssUrl(images.stageMiddleMobile)}`,
  );
  const picnicStage = $derived(
    `--stage-bg: ${cssUrl(images.stagePicnic)}; --stage-bg-mobile: ${cssUrl(images.stagePicnicMobile)}`,
  );

  const pageTitle = $derived(
    site.meta.title.trim() || `Haven — ${preview.eventName}`,
  );

  function onMessage(e: MessageEvent<ToPreview>) {
    if (e.origin !== location.origin) return;
    const msg = e.data;
    if (msg?.type === "state") {
      preview.doc = msg.doc;
      preview.eventName = msg.eventName;
      preview.selected = msg.selected;
      preview.openFaq = msg.openFaq;
      preview.showHidden = msg.showHidden;
      preview.ready = true;
    } else if (msg?.type === "scroll") {
      document
        .querySelector(`[data-section="${msg.target}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Nothing in the preview should navigate or submit; clicks on blank parts
  // of a section select the section itself.
  function onClickCapture(e: MouseEvent) {
    if ((e.target as HTMLElement).closest("a")) e.preventDefault();
  }

  function onClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.closest("[data-editable], [data-ed-add], [data-ed-tools]")) return;
    const section = target.closest<HTMLElement>("[data-section]")?.dataset.section;
    post({ type: "select", path: section ? [section] : null });
  }

  function onKeydown(e: KeyboardEvent) {
    if (!(e.metaKey || e.ctrlKey)) return;
    const key = e.key.toLowerCase();
    if (key === "z" || key === "y") {
      e.preventDefault();
      post({ type: "history", action: key === "y" || e.shiftKey ? "redo" : "undo" });
    }
  }

  $effect(() => {
    post({ type: "ready" });
  });
</script>

<svelte:window onmessage={onMessage} onkeydown={onKeydown} onclickcapture={onClickCapture} />
<svelte:document onclick={onClick} onsubmit={(e) => e.preventDefault()} />

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<Fonts {fonts} />

{#if preview.ready}
  <SiteHeader {images} nav={site.nav} />

  <main id="main" class="overflow-x-clip">
    <div class="relative z-20">
      <Hero title={preview.eventName} tagline={site.tagline} hero={site.hero} {images} />
    </div>

    <div id="about" class="stage stage-middle z-10" style={middleStage}>
      <About title={site.about.title} body={site.about.body} perks={site.about.perks} {images} />
      <Pitch heading={site.pitch.heading} items={site.pitch.items} {images} />
    </div>

    <div class="z-20">
      <Steps
        heading={site.steps.heading}
        subheading={site.steps.subheading}
        cta={site.steps.cta}
        {images}
      />
    </div>

    <Schedule
      heading={site.schedule.heading}
      days={site.schedule.days}
      tbd={site.schedule.tbd}
      {images}
    />

    <div class="stage stage-picnic" style={picnicStage}>
      <PastEvents
        heading={site.pastEvents.heading}
        items={site.pastEvents.items}
        safety={site.pastEvents.safety}
      />
    </div>

    <Sponsors heading={site.sponsors.heading} items={site.sponsors.items} {images} />

    <Faq heading={site.faq.heading} items={site.faq.items} cta={site.faq.cta} {images} />
  </main>

  <SiteFooter {images} footer={site.footer} />
{/if}
