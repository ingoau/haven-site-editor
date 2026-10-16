<script lang="ts">
  import { cssUrl, type SiteImages } from "$lib/data/images";
  import type { Perk } from "$lib/data/types";
  import AddChip from "$lib/preview/AddChip.svelte";
  import { asset, item, text } from "$lib/preview/edit.svelte";

  interface Props {
    title: string;
    body: string;
    perks: Perk[];
    images: SiteImages;
  }

  let { title, body, perks, images }: Props = $props();

  const intro = "md:absolute md:left-[16.1%] md:top-[5.6%] md:w-[30%]";
  const daven = "md:absolute md:left-[65.8%] md:top-[5.6%] md:w-[7.5%]";

  // The illustration behind this section has three sign-shaped gaps in it, so
  // the perks are placed by position rather than by name — a page that renames
  // them still lands in the slots, and a fourth one simply stacks below.
  const stage = [
    "md:absolute md:left-[4.8%] md:top-[13%] md:w-[40%]",
    "md:absolute md:left-[56%] md:top-[18%] md:w-[40%]",
    "md:absolute md:left-[20 %] md:top-[35%] md:w-[40%]",
  ];
</script>

<section
  data-section="about"
  class="relative flex flex-col gap-[clamp(2.5rem,6vw,4rem)] overflow-x-clip px-18 pb-[clamp(3rem,7vw,6rem)] pt-[max(3.5rem,14vw)] sm:px-36 md:contents"
>
  <div
    class="panel bg-haven-green-deep/60 shadow-[0_0_10px_var(--color-haven-green-deep)] w-full max-w-[40rem] self-center px-[clamp(2rem,4vw,4rem)] py-[clamp(1.25rem,2.2vw,1.75rem)] text-center md:shadow-none md:self-start md:max-w-[42rem] md:bg-transparent md:p-0 md:text-left {intro}"
  >
    <h2
      class="font-display text-heading text-white md:text-[3cqw] md:leading-[0.8]"
      {@attach text(["about", "title"], title, { placeholder: "Heading" })}
    ></h2>
    <p
      class="mt-[1em] font-body text-lead leading-[1.15] text-white md:text-[1.5cqw]"
      {@attach text(["about", "body"], body, { placeholder: "A sentence about your jam" })}
    ></p>
  </div>

  <img
    src={images.aboutDaven}
    alt=""
    aria-hidden="true"
    width="108"
    height="108"
    class="hidden select-none md:block {daven}"
  />

  {#each perks as perk, index (index)}
    <div
      class={[
        "w-full max-w-[40rem] md:max-w-none md:p-[2.1%]",
        perk.side === "end" ? "self-end" : "self-start",
        stage[index],
      ]}
      {@attach item(["about", "perks"], index, { kind: "perk", label: "Sign" })}
    >
      <div class="relative w-full aspect-1972/1413">
        <img
          src={images.aboutSignSide}
          alt=""
          aria-hidden="true"
          class={[
            "pointer-events-none absolute -translate-x-3/4 -inset-[8%] xz-10 h-[116%] w-[116%] object-contain -scale-x-100",
            perk.side === "end" && "scale-x-100 translate-x-5/6",
          ]}
        />

        <div
          class="absolute inset-0 flex flex-col justify-center overflow-hidden bg-cover bg-no-repeat bg-center px-[clamp(1.5rem,8vw,6rem)] py-[clamp(1.25rem,2.2vw,1.75rem)] text-center md:px-[12%] md:py-[4%]"
          style="background-image: {cssUrl(images.aboutSignBack)}"
        >
          <ul
            class="px-2 pt-[clamp(2.5rem,8vw,7rem)] md:px-6 grid grid-cols-2 gap-[clamp(1rem,3vw,5rem)] md:pt-[15%] md:gap-[3%]"
          >
            {#each perk.photos as photo, photoIndex (photoIndex)}
              <li
                {@attach item(["about", "perks", index, "photos"], photoIndex, {
                  kind: "photo",
                  axis: "x",
                  label: "Photo",
                })}
              >
                <div class="block">
                  <img
                    src={asset(photo.src)}
                    alt={photo.alt}
                    decoding="async"
                    class={[
                      "w-full rounded-[clamp(0.625rem,1vw,1rem)] object-cover md:rounded-[1cqw]",
                      index === 0
                        ? "mt-[clamp(0.3rem,2vw,3rem)] h-[clamp(2.5rem,15vw,6rem)] md:h-[6.5cqw]"
                        : "h-[clamp(3.5rem,18vw,5rem)] md:h-[9cqw]",
                      photo.position,
                    ]}
                  />
                  {#if photo.caption}
                    <span
                      class="mt-1.5 block font-body text-[clamp(0.3rem,1.2vw,1.2rem)] leading-[clamp(0.2rem,1vw,1.5rem)] tracking-[-0.03em] text-haven-brown-light md:mt-[3%] md:text-[1cqw]"
                    >
                      <span
                        class="block"
                        {@attach text(["about", "perks", index, "photos", photoIndex, "caption", "title"], photo.caption.title, { placeholder: "Game title" })}
                      ></span>
                      <span
                        class="block text-[0.8em]"
                        {@attach text(["about", "perks", index, "photos", photoIndex, "caption", "author"], photo.caption.author, { placeholder: "by…" })}
                      ></span>
                    </span>
                  {/if}
                </div>
              </li>
            {/each}
          </ul>
          {#each perk.blurb as line, lineIndex (lineIndex)}
            <p
              class={[
                "font-body leading-[clamp(0.75rem,3vw,1.5rem)] text-haven-brown-dark pb-4 md:text-[1.4cqw] md:leading-[1.15]",
                index === 0
                  ? "text-[clamp(0.45rem,2.1vw,3rem)] mt-[clamp(0.3rem,1vw,1rem)] md:mt-[3%]"
                  : "text-[clamp(0.75rem,3vw,3rem)] mt-[clamp(0.5rem,2vw,3rem)] md:mt-[3%]",
              ]}
              {@attach text(["about", "perks", index, "blurb", lineIndex], line, { placeholder: "A line under the photos" })}
            ></p>
          {/each}
        </div>

        <div
          class="absolute left-1/2 top-0 z-10 w-max -translate-x-[52%] translate-y-[clamp(1rem,calc(-1.61rem_+_10.43vw),2.5rem)] sm:translate-y-[clamp(2.0rem,2.0rem-0.5vw,2.2rem)] md:translate-y-[100%]"
        >
          <h3
            class="relative font-display z-10 whitespace-nowrap text-heading text-white md:text-[3.06cqw] md:leading-[0.8]"
            {@attach text(["about", "perks", index, "title"], perk.title, { placeholder: "Sign title" })}
          ></h3>
        </div>
      </div>
    </div>
  {/each}

  {#if perks.length < 3}
    <div class="ed-only flex justify-center md:absolute md:left-[40%] md:top-[50%]">
      <AddChip list={["about", "perks"]} kind="perk" label="Add a sign" length={perks.length} />
    </div>
  {/if}
</section>
