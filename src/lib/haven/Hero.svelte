<script lang="ts">
  import { cssUrl, type SiteImages } from "$lib/data/images";
  import type { EditorDoc } from "$lib/editor/doc";
  import AddChip from "$lib/preview/AddChip.svelte";
  import { item, pick, text } from "$lib/preview/edit.svelte";

  interface Props {
    title: string;
    tagline: string[];
    hero: EditorDoc["hero"];
    images: SiteImages;
  }

  let { title, tagline, hero, images }: Props = $props();
</script>

<section
  id="top"
  data-section="hero"
  style="background-image: {cssUrl(images.heroBackground)}"
  class="rule-frame relative isolate flex min-h-svh flex-col bg-haven-green bg-cover bg-top bg-no-repeat px-4 pb-[36vw] sm:pb-[clamp(3rem,10vw,min(8rem,8svh))] [--frame-gap:clamp(0.75rem,1.1vw,1rem)] [--frame-offset:clamp(0.5rem,1.1vw,1rem)] [--frame-weight:clamp(3px,0.35vw,5px)]"
>
  <div class="block sm:contents">
    <div
      class="pointer-events-none relative z-10 flex flex-1 items-center justify-center mt-[clamp(5rem,14vw,20rem)] sm:mt-[clamp(1rem,2vw,15rem)]"
    >
      <div
        class="mx-auto flex w-full flex-col items-center px-[clamp(1rem,4vw,8rem)] text-center sm:pl-[clamp(1rem,4vw,8rem)] sm:items-start sm:pr-[clamp(20rem,45vw,60rem)]"
      >
        <div class="grid grid-cols-2 max-w-[1700px]">
          <img
            src={images.logo}
            alt="Hack Club Haven"
            width="778"
            height="445"
            class="w-[120%] max-w-none"
          />
          <h1
            class="m-0 font-display text-[clamp(1rem,8vw,10rem)] leading-[clamp(1rem,6vw,8rem)] text-white translate-y-[75%] translate-x-[-10%] sm:text-hero sm:leading-[clamp(1rem,4vw,8rem)]"
          >
            <span
              class="pointer-events-auto"
              title="Your event's name comes from Airtable; this one is only for the preview"
              {@attach text(["$eventName"], title, { placeholder: "City" })}
            ></span>
          </h1>
        </div>

        <div
          class="pointer-events-auto glow-orange mt-[clamp(1rem,10vw,10rem)] text-[clamp(1rem,4vw,8rem)] leading-[clamp(1rem,4.75vw,5rem)] font-body text-center text-white sm:ml-[clamp(1rem,3vw,8rem)] sm:mt-[clamp(1rem,5vw,10rem)] sm:text-[clamp(1.25rem,2vw,4rem)] sm:leading-[clamp(1.5rem,2.75vw,5rem)] sm:text-start"
        >
          {#each tagline as part, i (i)}
            <div
              class={i === 0 ? "whitespace-nowrap" : "block"}
              {@attach item(["tagline"], i, { kind: "tagline", label: "Line" })}
            >
              <span {@attach text(["tagline", i], part, { placeholder: "Tagline line" })}></span>
            </div>
          {/each}
          <AddChip list={["tagline"]} kind="line" dropKind="tagline" label="Add line" length={tagline.length} class="ed-add-light" />
        </div>

        <!-- The real page has an email box here; the placeholder is editable text. -->
        <div
          class="pointer-events-auto mt-[clamp(1rem,1vw,5rem)] flex w-[min(90%,28rem)] items-center gap-2 rounded-[clamp(0.5rem,2.5vw,1.5rem)] bg-white/70 p-[clamp(0.4rem,0.5vw,0.625rem)] shadow-[0_0_8px_2px_rgb(250_104_27/0.65)] sm:ml-[clamp(1rem,3vw,8rem)] sm:w-[clamp(15rem,35vw,60rem)]"
          {@attach pick(["hero", "signup"], "Signup box")}
        >
          <span
            class="min-w-0 flex-1 px-[clamp(0.75rem,1.6vw,1.5rem)] py-1 text-start font-body text-[clamp(1rem,2vw,3.125rem)] leading-tight tracking-[-0.03em] text-haven-orange-deep/80"
            {@attach text(["hero", "signup", "placeholder"], hero.signup.placeholder, { placeholder: "Email placeholder" })}
          ></span>
          <span
            class="shrink-0 rounded-[clamp(0.25rem,2.5vw,1.25rem)] bg-haven-orange-bright px-[clamp(0.9rem,1.9vw,2rem)] py-[clamp(0.5rem,0.7vw,1rem)] text-[clamp(1rem,2vw,3.125rem)] text-white"
            {@attach text(["hero", "signup", "button"], hero.signup.button, { placeholder: "Button" })}
          ></span>
        </div>
        <a
          href="#top"
          class="pointer-events-auto glow-orange mt-[clamp(0.75rem,1.5vw,1.25rem)] font-body text-[clamp(0.5rem,1vw,1.5rem)] text-white underline decoration-from-font underline-offset-4 sm:ml-[clamp(1rem,3vw,8rem)] sm:text-start sm:text-[clamp(0.9rem,1.6vw,1.75rem)]"
          {@attach text(["hero", "organizeCta"], hero.organizeCta, { placeholder: "Organizer link" })}
        ></a>
      </div>
    </div>

    <div
      class="absolute z-10 shell left-1/2 -translate-x-1/2 bottom-[clamp(3rem,3vw,10rem)] justify-center"
    >
      <div class="flex flex-col items-center gap-1">
        <span
          class="font-body text-[clamp(0.5rem,4vw,3rem)] text-white/60 md:text-[clamp(0.5rem,2vw,3rem)]"
          {@attach text(["hero", "scrollLabel"], hero.scrollLabel, { placeholder: "Scroll label" })}
        ></span>
        <img
          src={images.scrollArrow}
          alt=""
          aria-hidden="true"
          width="207"
          height="69"
          class="w-[clamp(2rem,16vw,12rem)] -scale-y-100 md:w-[clamp(2rem,8vw,12rem)]"
        />
      </div>
    </div>

    <div
      class="panel relative z-0 mx-auto mt-[clamp(2rem,8vw,8rem)] w-[min(85%,28rem)] h-[clamp(20rem,60vw,40rem)] sm:absolute sm:right-10 sm:top-1/2 sm:mx-[clamp(1.5rem,4vw,8rem)] sm:mt-[clamp(2rem,4vw,8rem)] sm:w-[clamp(15rem,35vw,52rem)] sm:h-[clamp(10rem,25vw,50rem)] sm:-translate-y-1/2 lg:w-[clamp(15rem,35vw,80rem)]"
    >
      <!-- The live map needs Haven's servers; this stands in for it. -->
      <div class="map-stand-in absolute inset-0 overflow-hidden rounded-[inherit]">
        {#each [[18, 38], [30, 30], [47, 34], [52, 52], [70, 40], [78, 62], [24, 60], [62, 28]] as [x, y]}
          <img
            src={images.mapPin}
            alt=""
            aria-hidden="true"
            class="absolute w-[6%] -translate-x-1/2 -translate-y-full"
            style="left: {x}%; top: {y}%"
          />
        {/each}
        <span class="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/80 px-3 py-1 font-body text-[clamp(0.7rem,1vw,1rem)] whitespace-nowrap text-haven-orange-deep">
          map of events
        </span>
      </div>

      <img
        src={images.heroArrow}
        alt=""
        aria-hidden="true"
        class="absolute rotate-24 right-[clamp(1rem,4vw,8rem)] top-[clamp(0rem,0vw,10rem)] z-20 w-[clamp(2rem,12vw,6rem)] sm:right-[clamp(1rem,12vw,30rem)] sm:top-[clamp(-10rem,-3vw,0rem)] sm:w-[clamp(2rem,8vw,20rem)] hidden sm:block"
      />
      <img
        src={images.heroArrowMobile}
        alt=""
        aria-hidden="true"
        class="absolute rotate-24 right-[clamp(1rem,6vw,10rem)] top-[clamp(-10rem,-2vw,0rem)] z-20 w-[clamp(2rem,12vw,6rem)] block sm:hidden"
      />
      <p
        class="relative z-30 text-white text-center -translate-y-[120%] left-50 text-[clamp(0.875rem,4vw,10rem)] sm:text-haven-butter sm:left-0 sm:-rotate-8 sm:text-[clamp(1rem,3vw,10rem)] sm:-translate-y-[120%] sm:-translate-x-[40%]"
        {@attach text(["hero", "mapLabel"], hero.mapLabel, { placeholder: "Map label" })}
      ></p>
    </div>

    <img
      src={images.hedgehog}
      alt=""
      aria-hidden="true"
      width="422"
      height="308"
      class="pointer-events-none absolute object-contain bottom-0 right-[6%] z-20 w-[clamp(8rem,40vw,14rem)] scale-x-[-1] aspect-422/308 select-none sm:right-[9.6%] sm:max-h-[30svh] sm:w-[15%] sm:max-w-[21rem]"
    />

    <img
      src={images.heroForeground}
      alt=""
      aria-hidden="true"
      width="1414"
      height="501"
      class="pointer-events-none absolute inset-x-0 bottom-0 z-20 w-full max-w-none translate-y-[55%] select-none"
    />
  </div>
</section>
