/** Blank items for every list the page has, keyed by what kind of list it is. */
export const templates = {
  line: () => "new line",
  perk: () => ({
    title: "New sign",
    side: "start" as const,
    blurb: ["a line about it"],
    photos: [
      { src: "/images/friends-1.webp", alt: "" },
      { src: "/images/friends-2.webp", alt: "" },
    ],
  }),
  photo: () => ({ src: "/images/projects-2.webp", alt: "" }),
  pitch: () => ({
    align: "start" as const,
    body: [{ text: "Something worth " }, { text: "shouting about", mark: true }, { text: "." }],
  }),
  marked: () => ({ text: " more text" }),
  linked: () => ({ text: " more text" }),
  day: () => ({
    day: "Saturday",
    items: [{ time: "10:00 am", title: "doors open", body: "" }],
  }),
  scheduleItem: () => ({ time: "12:00 pm", title: "new item", body: "" }),
  pastEvent: () => ({
    title: "Our last jam",
    caption: "A sentence about what happened.",
    image: "/images/scrapyard-pic.webp",
    alt: "",
    play: "/images/play-triangle-1.svg",
    href: "https://www.youtube.com/",
  }),
  sponsor: () => ({
    name: "A Local Company",
    image: "https://assets.hackclub.com/icon-rounded.png",
    href: "https://hackclub.com/",
  }),
  faq: () => ({ q: "A new question?", a: [{ text: "The answer." }] }),
  paragraph: () => [{ text: "A new paragraph." }],
} as const;

export type TemplateKind = keyof typeof templates;

export function makeItem(kind: string): unknown {
  const make = templates[kind as TemplateKind];
  return make ? make() : "";
}
