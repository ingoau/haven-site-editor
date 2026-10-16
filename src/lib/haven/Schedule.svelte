<script lang="ts">
  import type { SiteImages } from "$lib/data/images";
  import type { ScheduleDay } from "$lib/data/types";
  import { pathKey, type Path } from "$lib/editor/doc";
  import AddChip from "$lib/preview/AddChip.svelte";
  import { item, pick, preview, text } from "$lib/preview/edit.svelte";

  interface Props {
    heading: string;
    days: ScheduleDay[];
    /** Shown in place of the timetable until there are any days with items. */
    tbd: { title: string; body: string };
    images: SiteImages;
  }

  let { heading, days, tbd, images }: Props = $props();

  const isSelected = (path: Path) =>
    !!preview.selected && pathKey(preview.selected).startsWith(pathKey(path));

  const filled = $derived(days.filter((day) => day.items.length > 0));
</script>

<section
  id="schedule"
  data-section="schedule"
  class="relative z-10 bg-haven-green mt-[clamp(2.5rem,10vw,15rem)] mb-[clamp(1rem,5vw,8rem)] py-[clamp(1rem,3vw,4rem)]"
>
  <img
    src={images.scheduleTrail}
    alt=""
    aria-hidden="true"
    class="absolute top-0 w-full object-cover translate-y-[-60%] md:-translate-y-1/2"
  />
  <img
    src={images.scheduleTrail}
    alt=""
    aria-hidden="true"
    class="absolute bottom-0 w-full object-cover scale-[-1] translate-y-[30%] md:translate-y-1/2"
  />
  <div class="absolute inset-y-0 left-0 w-[15%] overflow-hidden">
    <img
      src={images.scheduleTrailSide}
      alt=""
      aria-hidden="true"
      class="w-full object-cover translate-y-[-5%]"
    />
  </div>
  <div class="absolute inset-y-0 right-0 w-[15%] overflow-hidden">
    <img
      src={images.scheduleTrailSide}
      alt=""
      aria-hidden="true"
      class="w-full scale-[-1] object-cover translate-y-[-5%]"
    />
  </div>
  <img
    src={images.schedulePlantsSmall}
    alt=""
    aria-hidden="true"
    class="absolute z-20 w-[8%] right-0 top-0 object-cover translate-y-[-35%]"
  />
  <img
    src={images.schedulePlantsLarge}
    alt=""
    aria-hidden="true"
    class="absolute z-20 scale-x-[-1] w-[10%] left-0 top-0 object-cover translate-y-[-30%]"
  />
  <img
    src={images.schedulePlantsLarge}
    alt=""
    aria-hidden="true"
    class="absolute z-20 w-[10%] right-0 bottom-0 object-cover"
  />
  <img
    src={images.schedulePlantsSmall}
    alt=""
    aria-hidden="true"
    class="absolute z-20 scale-x-[-1] w-[8%] left-0 bottom-0 object-cover"
  />
  <img
    src={images.scheduleSheep}
    alt=""
    aria-hidden="true"
    class="absolute z-0 h-[50%] max-h-200 left-[clamp(0rem,3vw,4rem)] bottom-30 object-cover md:left-[clamp(1rem,5vw,14rem)]"
  />
  <img
    src={images.scheduleDaven}
    alt=""
    aria-hidden="true"
    class="absolute z-0 w-[8%] right-3 top-18 object-cover md:right-[clamp(1rem,3vw,4rem)]"
  />
  <div
    class="relative w-[70%] z-20 shell bg-haven-brown-dark my-2 mb-[clamp(1.5rem,6vw,5rem)] py-6 rounded-[clamp(1rem,2vw,2rem)] sm:my-8 sm:mb-[clamp(2rem,8vw,5rem)] sm:py-8 sm:rounded-[3rem] md:my-16 md:py-16 md:rounded-[5rem]"
  >
    <h2
      class="relative text-center z-15 font-display text-[clamp(1.75rem,5vw,4rem)] leading-[clamp(1.5rem,1.5vw,1.75rem)] tracking-[-0.05em] text-white"
      {@attach text(["schedule", "heading"], heading, { placeholder: "Heading" })}
    ></h2>
    <img
      src={images.schedulePlantLeft}
      alt=""
      aria-hidden="true"
      class="absolute z-10 top-0 -translate-y-[45%] left-[clamp(1.8rem,8vw,6rem)] w-[20%] object-cover block sm:w-[26%] sm:left-[clamp(2rem,6vw,4rem)] md:hidden"
    />
    <img
      src={images.schedulePlantRight}
      alt=""
      aria-hidden="true"
      class="absolute z-10 top-0 -translate-y-[45%] right-[clamp(2.3rem,9vw,6rem)] w-[26%] object-cover block sm:w-[32%] sm:right-[clamp(3rem,8vw,6rem)] md:hidden"
    />
    {#if days.length > 0}
      <div
        class={[
          "mx-auto px-[clamp(1rem,6vw,8rem)] mt-[clamp(1rem,3.5vw,3rem)] grid grid-cols-1 gap-[clamp(0.5rem,2vw,1.75rem)] md:px-[clamp(2rem,6vw,8rem)]",
          // A lone day would otherwise sit in a half-width column with nothing
          // beside it, so it only splits into two once there is a second day.
          filled.length > 1 && "2xl:grid-cols-2",
        ]}
      >
        {#each days as day, dayIndex (dayIndex)}
          <section
            class={[
              "panel px-[clamp(0.2rem,2.4vw,2.25rem)] py-[clamp(1rem,2.2vw,2rem)] bg-haven-brown-light",
              day.items.length === 0 && "ed-hidden-on-site",
            ]}
            data-hidden-note="Hidden until it has items"
            {@attach item(["schedule", "days"], dayIndex, { kind: "day", label: "Day" })}
          >
            <h3
              class="font-display text-heading text-haven-butter"
              {@attach text(["schedule", "days", dayIndex, "day"], day.day, { placeholder: "Day" })}
            ></h3>

            <ol
              class="mt-[clamp(0.75rem,1.6vw,1.25rem)] flex flex-col gap-[clamp(0.2rem,1vw,1.1rem)]"
            >
              {#each day.items as entry, itemIndex (itemIndex)}
                <li
                  class="flex gap-x-[clamp(0.5rem,2vw,2.25rem)] flex-row items-baseline"
                  {@attach item(["schedule", "days", dayIndex, "items"], itemIndex, { kind: "scheduleItem", label: "Item", tools: "outside" })}
                >
                  <span
                    class="w-[clamp(5rem,10vw,8rem)] font-display text-subheading whitespace-nowrap text-white shrink-0"
                    {@attach text(["schedule", "days", dayIndex, "items", itemIndex, "time"], entry.time, { placeholder: "Time" })}
                  ></span>
                  <span class="flex-1">
                    <span
                      class="block font-display text-subheading line-height leading-none text-white"
                      {@attach text(["schedule", "days", dayIndex, "items", itemIndex, "title"], entry.title, { placeholder: "What happens" })}
                    ></span>
                    {#if entry.body || isSelected(["schedule", "days", dayIndex, "items", itemIndex])}
                      <span
                        class="mt-2 block font-body text-copy text-white"
                        {@attach text(["schedule", "days", dayIndex, "items", itemIndex, "body"], entry.body ?? "", { placeholder: "Optional detail" })}
                      ></span>
                    {/if}
                  </span>
                </li>
              {/each}
            </ol>
            <AddChip
              list={["schedule", "days", dayIndex, "items"]}
              kind="scheduleItem"
              label="Add item"
              length={day.items.length}
              class="ed-add-light mt-3"
            />
          </section>
        {/each}
      </div>
    {:else}
      <p
        class="panel mx-auto mt-[clamp(1.5rem,3.5vw,3rem)] max-w-[31.5rem] px-[clamp(1.25rem,2.4vw,2.25rem)] py-[clamp(1.5rem,2.6vw,2.25rem)] text-center"
        {@attach pick(["schedule", "tbd"], "Placeholder")}
      >
        <span
          class="block font-display text-heading text-haven-orange-bright"
          {@attach text(["schedule", "tbd", "title"], tbd.title, { placeholder: "TBD!" })}
        ></span>
        <span
          class="mt-[clamp(0.5rem,1vw,0.75rem)] block font-body text-copy text-haven-orange-mid"
          {@attach text(["schedule", "tbd", "body"], tbd.body, { placeholder: "Shown until you add a schedule" })}
        ></span>
      </p>
    {/if}
    <div class="ed-only mt-6 flex justify-center">
      <AddChip list={["schedule", "days"]} kind="day" label="Add a day" length={days.length} class="ed-add-light" />
    </div>
  </div>
</section>
