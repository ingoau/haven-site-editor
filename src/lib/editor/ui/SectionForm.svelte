<script lang="ts">
  import type { Path } from "../doc";
  import type { SectionId } from "../sections";
  import { editor } from "../store.svelte";
  import Choice from "./Choice.svelte";
  import Field from "./Field.svelte";
  import LinesField from "./LinesField.svelte";
  import ListField from "./ListField.svelte";
  import SegmentsField from "./SegmentsField.svelte";
  import Artwork from "./Artwork.svelte";
  import JsonPanel from "./JsonPanel.svelte";
  import SharePreview from "./SharePreview.svelte";

  let { section }: { section: SectionId } = $props();

  const positions = [
    { value: "", label: "Center" },
    { value: "object-top", label: "Top" },
    { value: "object-bottom", label: "Bottom" },
    { value: "object-left", label: "Left" },
    { value: "object-right", label: "Right" },
  ];

  const plain = (segs: { text: string }[]) => segs.map((s) => s.text).join("").trim();
  const threeSpots = (what: string) => (n: number) =>
    n > 3
      ? `Only the first three ${what} have a spot painted for them; the rest stack underneath.`
      : n < 3
        ? `The artwork has three spots for ${what}, filled in order.`
        : undefined;
</script>

{#if section === "page"}
  <fieldset>
    <legend>Your event</legend>
    <div class="field">
      <label for="event-name">City name</label>
      <input
        id="event-name"
        type="text"
        value={editor.eventName}
        oninput={(e) => (editor.eventName = e.currentTarget.value)}
        onfocus={() => (editor.selected = ["$eventName"])}
      />
      <p class="field-hint">
        Preview only. The big name on your page comes from your event's Airtable row, not from
        this document.
      </p>
    </div>
  </fieldset>

  <fieldset>
    <legend>Share card</legend>
    <SharePreview />
    <Field
      path={["meta", "title"]}
      label="Title"
      placeholder="Haven — {editor.eventName}"
      hint="The browser tab and link previews. Leave empty for “Haven — {editor.eventName}”."
    />
    <Field path={["meta", "description"]} label="Description" multiline />
    <Field
      path={["meta", "image"]}
      label="Image"
      kind="image"
      hint="At least 1200×630, or it shows as a small square."
    />
  </fieldset>

  <fieldset>
    <legend>Top-right links</legend>
    <p class="field-hint">Only the words change; they always jump to the same sections.</p>
    <div class="grid-3">
      <Field path={["nav", "signup"]} label="Sign up" />
      <Field path={["nav", "about"]} label="About" />
      <Field path={["nav", "faq"]} label="FAQ" />
    </div>
  </fieldset>

  <fieldset>
    <legend>Fonts</legend>
    <p class="field-hint">
      Type a family name exactly as <a href="https://fonts.google.com" target="_blank" rel="noopener">Google Fonts</a>
      shows it, or add a link to your own .woff2 file. Leave empty for Haven's.
    </p>
    <Field path={["fonts", "display", "family"]} label="Headings" placeholder="Darumadrop One" />
    <Field path={["fonts", "display", "src"]} label="Headings font file (optional)" kind="url" placeholder="https://…/font.woff2" />
    <Field path={["fonts", "body", "family"]} label="Everything else" placeholder="Jua" />
    <Field path={["fonts", "body", "src"]} label="Body font file (optional)" kind="url" placeholder="https://…/font.woff2" />
  </fieldset>
{:else if section === "hero"}
  <LinesField
    path={["tagline"]}
    label="Tagline"
    hint="Each entry is its own line. The first stays on one line even on phones, so keep it short."
  />
  <Field path={["hero", "signup", "placeholder"]} label="Email box placeholder" />
  <Field path={["hero", "signup", "button"]} label="Sign-up button" hint="A couple of words." />
  <Field
    path={["hero", "signup", "lang"]}
    label="Sign-up form language"
    placeholder="en"
    hint="Optional two-letter code, like fi, to open the sign-up form in that language."
  />
  <Field path={["hero", "organizeCta"]} label="Organizer link" />
  <Field path={["hero", "mapLabel"]} label="Map label" />
  <Field path={["hero", "scrollLabel"]} label="Scroll arrow label" />
{:else if section === "about"}
  <Field path={["about", "title"]} label="Heading" />
  <Field path={["about", "body"]} label="Sentence" multiline />
  <ListField
    path={["about", "perks"]}
    kind="perk"
    label="Wooden signs"
    noun="sign"
    summary={(perk: any) => perk.title}
    note={threeSpots("signs")}
  >
    {#snippet body(p: Path)}
      <Field path={[...p, "title"]} label="Title" />
      <Choice
        path={[...p, "side"]}
        label="Signpost leans"
        options={[
          { value: "start", label: "Left" },
          { value: "end", label: "Right" },
        ]}
      />
      <LinesField path={[...p, "blurb"]} label="Lines under the photos" />
      <ListField
        path={[...p, "photos"]}
        kind="photo"
        label="Photos"
        noun="photo"
        group="photo"
        hint="Two per sign looks right."
        summary={(photo: any) => photo.caption?.title || photo.alt || photo.src.split("/").pop()}
      >
        {#snippet body(pp: Path, photo: any)}
          <Field path={[...pp, "src"]} label="Picture" kind="image" />
          <Field path={[...pp, "alt"]} label="Description" hint="Read aloud to people using a screen reader." />
          <Field path={[...pp, "href"]} label="Link (optional)" kind="url" />
          <Choice path={[...pp, "position"]} label="Keep this part when cropped" options={positions} />
          {#if photo.caption}
            <Field path={[...pp, "caption", "title"]} label="Credit title" />
            <Field path={[...pp, "caption", "author"]} label="Credit author" />
            <button type="button" class="link-button" onclick={() => editor.set([...pp, "caption"], undefined)}>
              Remove credit
            </button>
          {:else}
            <button
              type="button"
              class="link-button"
              onclick={() => editor.set([...pp, "caption"], { title: "game title", author: "by someone" })}
            >
              Add a credit under the photo
            </button>
          {/if}
        {/snippet}
      </ListField>
    {/snippet}
  </ListField>
{:else if section === "pitch"}
  <Field path={["pitch", "heading"]} label="Heading" />
  <ListField
    path={["pitch", "items"]}
    kind="pitch"
    label="Bubbles"
    noun="bubble"
    summary={(item: any) => plain(item.body)}
    note={threeSpots("bubbles")}
  >
    {#snippet body(p: Path)}
      <Choice
        path={[...p, "align"]}
        label="Nudge"
        options={[
          { value: "start", label: "Left" },
          { value: "center", label: "Middle" },
          { value: "end", label: "Right" },
        ]}
      />
      <SegmentsField
        path={[...p, "body"]}
        label="Text"
        variant="marked"
        hint="Highlighted pieces get the orange marker stroke. Mind the spaces at the ends of pieces."
      />
    {/snippet}
  </ListField>
{:else if section === "steps"}
  <Field path={["steps", "heading"]} label="Heading" multiline />
  <Field path={["steps", "subheading"]} label="Subheading" />
  <p class="field-hint">The four illustrated steps are part of the artwork and can't be edited as text.</p>
  <fieldset>
    <legend>Organizer button</legend>
    <p class="field-hint">Only appears on the organizer page, not on city pages.</p>
    <Field path={["steps", "cta", "label"]} label="Label" />
    <Field path={["steps", "cta", "href"]} label="Link" kind="url" />
  </fieldset>
{:else if section === "schedule"}
  <Field path={["schedule", "heading"]} label="Heading" />
  <ListField
    path={["schedule", "days"]}
    kind="day"
    label="Days"
    noun="day"
    summary={(day: any) => `${day.day} · ${day.items.length} item${day.items.length === 1 ? "" : "s"}`}
    hint="A day with no items is hidden, so you can add Sunday early and fill it in later."
  >
    {#snippet body(p: Path)}
      <Field path={[...p, "day"]} label="Day" placeholder="Saturday, November 14" />
      <ListField
        path={[...p, "items"]}
        kind="scheduleItem"
        group="scheduleItem"
        label="Timetable"
        noun="item"
        summary={(item: any) => `${item.time} — ${item.title}`}
        hint="Drag items between days, too."
      >
        {#snippet body(pp: Path)}
          <div class="grid-2">
            <Field path={[...pp, "time"]} label="Time" placeholder="10:00 am" />
            <Field path={[...pp, "title"]} label="What happens" />
          </div>
          <Field path={[...pp, "body"]} label="Detail (optional)" multiline />
        {/snippet}
      </ListField>
    {/snippet}
  </ListField>
  <fieldset>
    <legend>Until there's a schedule</legend>
    <p class="field-hint">Shown instead of the timetable while no day has items.</p>
    <Field path={["schedule", "tbd", "title"]} label="Title" />
    <Field path={["schedule", "tbd", "body"]} label="Text" multiline />
  </fieldset>
{:else if section === "pastEvents"}
  <LinesField path={["pastEvents", "heading"]} label="Heading" />
  <ListField
    path={["pastEvents", "items"]}
    kind="pastEvent"
    label="Photo cards"
    noun="card"
    summary={(item: any) => item.title}
    note={threeSpots("cards")}
  >
    {#snippet body(p: Path)}
      <Field path={[...p, "title"]} label="Title" />
      <Field path={[...p, "caption"]} label="Caption" multiline />
      <Field path={[...p, "image"]} label="Photo" kind="image" />
      <Field path={[...p, "alt"]} label="Photo description" />
      <Choice path={[...p, "position"]} label="Keep this part when cropped" options={positions} />
      <Field path={[...p, "href"]} label="Link" kind="url" hint="Usually a video." />
      <Field path={[...p, "play"]} label="Play triangle" kind="image" />
    {/snippet}
  </ListField>
  <SegmentsField
    path={["pastEvents", "safety"]}
    label="Safety line"
    variant="linked"
    hint="If you change it, keep the parent guide link and a way to contact you."
  />
{:else if section === "sponsors"}
  <Field path={["sponsors", "heading"]} label="Heading" />
  <ListField
    path={["sponsors", "items"]}
    kind="sponsor"
    label="Sponsors"
    noun="sponsor"
    summary={(item: any) => item.name}
    hint="The section is hidden until you add one. Three per row, so 3, 6 or 9 look tidiest."
  >
    {#snippet body(p: Path)}
      <Field path={[...p, "name"]} label="Name" />
      <Field path={[...p, "image"]} label="Logo" kind="image" hint="A transparent background sits best on the artwork." />
      <Field path={[...p, "href"]} label="Website" kind="url" />
    {/snippet}
  </ListField>
{:else if section === "faq"}
  <Field path={["faq", "heading"]} label="Heading" />
  <Field path={["faq", "cta"]} label="Button under the questions" />
  <div class="field">
    <label class="check">
      <input type="checkbox" bind:checked={editor.openFaq} />
      Show every answer in the preview
    </label>
  </div>
  <ListField
    path={["faq", "items"]}
    kind="faq"
    label="Questions"
    noun="question"
    summary={(item: any) => item.q}
    hint="Questions alternate left and right, so an even number balances. Add your venue, parking and food questions here."
  >
    {#snippet body(p: Path)}
      <Field path={[...p, "q"]} label="Question" />
      <SegmentsField path={[...p, "a"]} label="Answer" variant="linked" />
    {/snippet}
  </ListField>
{:else if section === "footer"}
  <ListField
    path={["footer", "body"]}
    kind="paragraph"
    label="Paragraphs"
    noun="paragraph"
    summary={(item: any) => plain(item)}
  >
    {#snippet body(p: Path)}
      <SegmentsField path={p} label="Text" variant="linked" />
    {/snippet}
  </ListField>
  <fieldset>
    <legend>Hack Club links</legend>
    <p class="field-hint">Only the words change; they always go to the same Hack Club pages.</p>
    <div class="grid-2">
      <Field path={["footer", "links", "hackClub"]} label="Hack Club" />
      <Field path={["footer", "links", "slack"]} label="Slack" />
      <Field path={["footer", "links", "clubs"]} label="Clubs" />
      <Field path={["footer", "links", "hackathons"]} label="Hackathons" />
    </div>
  </fieldset>
{:else if section === "images"}
  <Artwork />
{:else if section === "json"}
  <JsonPanel />
{/if}
