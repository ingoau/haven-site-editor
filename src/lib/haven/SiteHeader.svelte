<script lang="ts">
  // The same three links on every page, city or not; only the labels change.
  import { navLinks } from "$lib/data/content";
  import type { SiteImages } from "$lib/data/images";
  import type { SiteData } from "$lib/data/types";
  import { text } from "$lib/preview/edit.svelte";

  interface Props {
    images: SiteImages;
    nav: SiteData["nav"];
  }

  let { images, nav }: Props = $props();
</script>

<header class="absolute inset-x-0 top-0 z-30">
  <img
    src={images.navBanner}
    alt=""
    aria-hidden="true"
    width="646"
    height="260"
    class="pointer-events-none fixed right-0 top-0 -z-10 w-[min(41rem,max(46%,calc(13rem_+_8vw)))] max-w-none select-none md:w-[45%] md:right-[clamp(-3rem,-2vw,0rem)] md:top-[clamp(-3rem,-2vw,0rem)]"
  />
</header>

<div
  data-nav-bar
  class="fixed inset-x-0 top-0 justify-end z-30 flex pb-3 pt-[clamp(0.5rem,1.4vw,1.5rem)] px-[clamp(1rem,4vw,4rem)] pointer-events-none"
>
  <nav class="pointer-events-auto" aria-label="Primary">
    <ul class="flex items-center gap-[clamp(1.125rem,2.2vw,2.75rem)]">
      {#each navLinks as link (link.href)}
        <li>
          <a
            href={link.href}
            class="inline-block py-1 font-display text-[clamp(1rem,3.5vw,8rem)] leading-none tracking-[-0.03em] text-haven-yellow transition-colors hover:text-white"
            {@attach text(["nav", link.key], nav[link.key], { placeholder: link.label })}
          ></a>
        </li>
      {/each}
    </ul>
  </nav>
</div>
