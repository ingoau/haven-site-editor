<script lang="ts">
  import { imageDefaults, type ImageKey } from "$lib/data/images";
  import { editor } from "../store.svelte";
  import { assetUrl, issueFor } from "./issues";

  // Grouped the way SITE_DATA.md lists them.
  const groups: { label: string; keys: ImageKey[] }[] = [
    { label: "Everywhere", keys: ["logo", "navBanner", "mapPin"] },
    {
      label: "Top of the page",
      keys: ["heroBackground", "heroArrow", "heroArrowMobile", "heroForeground", "hedgehog", "scrollArrow", "signupArrow", "videoChevron", "videoPlay"],
    },
    { label: "Section backdrops", keys: ["stageMiddle", "stageMiddleMobile", "stagePicnic", "stagePicnicMobile"] },
    { label: "What is a game jam?", keys: ["aboutDaven", "aboutSignSide", "aboutSignBack"] },
    {
      label: "Speech bubbles",
      keys: ["pitchTriangles", "pitchDaven", "pitchBubbleMobile", "pitchPanelMobile", "pitchBubble1", "pitchBubble2", "pitchBubble3"],
    },
    {
      label: "How to join",
      keys: ["stepsFlowerBorder", "stepsFlowersTopLeft", "stepsFlowersTopRight", "stepsFlowersBottomLeft", "stepsFlowersBottomRight", "stepsBackground", "stepsBackgroundPoc", "stepsBackgroundMobile", "stepsBackgroundPocMobile"],
    },
    {
      label: "Schedule",
      keys: ["scheduleTrail", "scheduleTrailSide", "schedulePlantsSmall", "schedulePlantsLarge", "scheduleSheep", "scheduleDaven", "schedulePlantLeft", "schedulePlantRight"],
    },
    {
      label: "Sponsors",
      keys: ["sponsorsEdgeTop", "sponsorsEdgeBottom", "sponsorsBushSmall", "sponsorsBushMedium", "sponsorsBushLarge", "sponsorsGrassSmall", "sponsorsGrassLarge", "sponsorsPumpkins", "sponsorsHouseLeft", "sponsorsHouseRight", "sponsorsHouseTop", "sponsorsBoxXl", "sponsorsBoxTall", "sponsorsBoxShort", "sponsorsTrail"],
    },
    {
      label: "FAQ",
      keys: ["faqSky", "faqGround", "faqBushLeft", "faqBushRight", "faqBushBack", "faqBushFrontRight", "faqBushFrontLeft", "faqPondLeft", "faqPondRight", "faqPondFront", "faqLeaves", "faqCard", "faqChevron", "faqArrow"],
    },
    { label: "Footer", keys: ["footerBushes"] },
  ];

  let filter = $state("");
  const changed = $derived(
    (Object.keys(imageDefaults) as ImageKey[]).filter((k) => editor.doc.images[k] !== imageDefaults[k]).length,
  );
  const matches = (key: string) => key.toLowerCase().includes(filter.trim().toLowerCase());
</script>

<p class="field-hint">
  Every picture on the page has a name. Most cities change none of these; your own photos go in the
  signs, cards and sponsors instead. Upload replacements somewhere public, like
  <a href="https://cdn.hackclub.com" target="_blank" rel="noopener">cdn.hackclub.com</a>, and paste the link.
  Match the shape of what you replace, and change a backdrop's phone version too.
</p>
<div class="field">
  <label for="art-filter">Find a picture</label>
  <input id="art-filter" type="search" bind:value={filter} placeholder="hedgehog, faq, sponsors…" />
  <p class="field-hint">{changed} of {Object.keys(imageDefaults).length} replaced.</p>
</div>

{#each groups as group (group.label)}
  {@const keys = group.keys.filter(matches)}
  {#if keys.length}
    <fieldset>
      <legend>{group.label}</legend>
      <ul class="art">
        {#each keys as key (key)}
          {@const value = editor.doc.images[key]}
          {@const issue = issueFor(["images", key])}
          <li class:art-changed={value !== imageDefaults[key]}>
            <img src={assetUrl(value)} alt="" loading="lazy" />
            <div class="art-body">
              <label for="img-{key}"><code>{key}</code></label>
              <input
                id="img-{key}"
                type="text"
                inputmode="url"
                spellcheck="false"
                {value}
                aria-invalid={!!issue}
                oninput={(e) => editor.set(["images", key], e.currentTarget.value)}
              />
              {#if issue}<p class="field-error">{issue}</p>{/if}
              {#if value !== imageDefaults[key]}
                <button type="button" class="link-button" onclick={() => editor.set(["images", key], imageDefaults[key])}>
                  Use Haven's
                </button>
              {/if}
            </div>
          </li>
        {/each}
      </ul>
    </fieldset>
  {/if}
{/each}
