<script lang="ts">
  import type { Linked, PastEvent } from "$lib/data/types";
  import AddChip from "$lib/preview/AddChip.svelte";
  import Segments from "$lib/preview/Segments.svelte";
  import { asset, item, pick, text } from "$lib/preview/edit.svelte";

  interface Props {
    /** One line per entry. */
    heading: string[];
    items: PastEvent[];
    safety: Linked;
  }

  let { heading, items, safety }: Props = $props();

  const stage = [
    "ml-[clamp(0rem,28vw-6rem,8rem)] md:absolute md:left-[9.2%] md:top-[31.2%] md:w-[25.8%]",
    "md:absolute md:left-[39.2%] md:top-[28.6%] md:w-[25.8%]",
    "mr-[clamp(0rem,28vw-6rem,8rem)] md:absolute md:left-[68.6%] md:top-[26.1%] md:w-[25.8%]",
  ];
</script>

<section
  data-section="pastEvents"
  class="relative flex flex-col gap-[clamp(1rem,4vw,1.5rem)] px-5 pb-[clamp(8rem,12vw,10rem)] pt-[clamp(6rem,8vw,8.5rem)] sm:pb-0 md:contents"
>
  <h2
    class="mx-auto max-w-[42ch] -rotate-3 text-center font-display text-subheading text-white pt-[clamp(6rem,40vw,20rem)] md:pt-0 md:absolute md:left-[15.2%] md:top-[20%] md:w-[71.1%] md:max-w-none md:-rotate-4 md:text-[2.43cqw] md:leading-[0.9]"
  >
    {#each heading as line, lineIndex (lineIndex)}<span
        class="block"
        {@attach item(["pastEvents", "heading"], lineIndex, { kind: "pastHeading", label: "Line", tools: "outside" })}
        ><span {@attach text(["pastEvents", "heading", lineIndex], line, { placeholder: "Heading line" })}></span></span
      >{/each}
    <AddChip list={["pastEvents", "heading"]} kind="line" dropKind="pastHeading" label="Add line" length={heading.length} class="ed-add-light rotate-0" />
  </h2>

  {#each items as event, i (i)}
    <article
      class={[
        "polaroid mx-auto flex w-[85%] max-w-[24rem] px-8 mt-12 md:mt-0 flex-col items-center gap-4 text-center md:px-[clamp(1.25rem,2vw,2rem)] md:mx-0 md:max-w-none",
        stage[i],
      ]}
      {@attach item(["pastEvents", "items"], i, { kind: "pastEvent", axis: "x", label: "Card" })}
    >
      <h3
        class="font-display text-[clamp(2rem,4vw,4rem)] pt-[clamp(1rem,4vw,1.5rem)] md:text-subheading text-white md:pt-4 md:text-[2.78cqw] md:leading-none"
        {@attach text(["pastEvents", "items", i, "title"], event.title, { placeholder: "Event name" })}
      ></h3>

      <div
        class="relative block w-full max-w-[clamp(20rem,100%,25rem)] overflow-hidden rounded-[1.25rem] border-2 border-white md:max-w-full md:rounded-[1.4cqw]"
      >
        <img
          src={asset(event.image)}
          alt={event.alt}
          decoding="async"
          class={["aspect-[3/2] w-full object-cover ", event.position]}
        />
        <img
          src={asset(event.play)}
          alt=""
          aria-hidden="true"
          width="72"
          height="65"
          class="pointer-events-none absolute top-1/2 left-1/2 w-[19%] -translate-x-1/2 -translate-y-1/2 -rotate-[40deg] select-none drop-shadow-[0_2px_6px_rgb(0_0_0/0.35)]"
        />
      </div>

      <p
        class="font-body text-subheading pb-[clamp(1rem,4vw,1.5rem)] md:py-0 text-white md:pb-6 md:text-[1.55cqw] md:leading-[1.05]"
        {@attach text(["pastEvents", "items", i, "caption"], event.caption, { placeholder: "A sentence about it" })}
      ></p>
    </article>
  {/each}

  {#if items.length < 3}
    <div class="ed-only flex justify-center md:absolute md:left-[45%] md:top-[50%]">
      <AddChip list={["pastEvents", "items"]} kind="pastEvent" label="Add a card" length={items.length} />
    </div>
  {/if}

  <h2
    class="mx-auto max-w-[42ch] -rotate-3 text-center font-display text-subheading text-white pt-[clamp(2rem,4vw,8rem)] md:pt-0 md:absolute md:left-[15.2%] md:bottom-[clamp(10%,20vw,18%)] md:w-[71.1%] md:px-[clamp(1.25rem,6vw,6rem)] md:max-w-none md:-rotate-4 md:text-[1.5cqw] md:leading-[0.9]"
    {@attach pick(["pastEvents", "safety"], "Safety line")}
  >
    <Segments
      path={["pastEvents", "safety"]}
      segments={safety}
      linkClass="text-haven-butter underline"
      select={["pastEvents", "safety"]}
    />
  </h2>
</section>
