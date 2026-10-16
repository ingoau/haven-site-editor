import type { Path } from "./doc";

export type SectionId =
  | "page"
  | "hero"
  | "about"
  | "pitch"
  | "steps"
  | "schedule"
  | "pastEvents"
  | "sponsors"
  | "faq"
  | "footer"
  | "images"
  | "json";

/** The side panel's sections, in the order they appear on the page. */
export const sections: { id: SectionId; label: string; preview?: string; reset?: string[] }[] = [
  { id: "page", label: "Page & sharing", preview: "hero", reset: ["meta", "nav", "fonts"] },
  { id: "hero", label: "Top of the page", preview: "hero", reset: ["hero", "tagline"] },
  { id: "about", label: "What is a game jam?", preview: "about", reset: ["about"] },
  { id: "pitch", label: "Speech bubbles", preview: "pitch", reset: ["pitch"] },
  { id: "steps", label: "How to join", preview: "steps", reset: ["steps"] },
  { id: "schedule", label: "Schedule", preview: "schedule", reset: ["schedule"] },
  { id: "pastEvents", label: "Past events", preview: "pastEvents", reset: ["pastEvents"] },
  { id: "sponsors", label: "Sponsors", preview: "sponsors", reset: ["sponsors"] },
  { id: "faq", label: "FAQ", preview: "faq", reset: ["faq"] },
  { id: "footer", label: "Footer", preview: "footer", reset: ["footer"] },
  { id: "images", label: "Artwork", reset: ["images"] },
  { id: "json", label: "JSON & submit" },
];

/** Which side-panel section a document path is edited in. */
export function sectionFor(path: Path): SectionId {
  const head = String(path[0]);
  if (["meta", "nav", "fonts", "$eventName"].includes(head)) return "page";
  if (head === "tagline") return "hero";
  if (sections.some((s) => s.id === head)) return head as SectionId;
  return "page";
}

/** Top-level document keys each section owns, for counting problems. */
export function keysFor(id: SectionId): string[] {
  return sections.find((s) => s.id === id)?.reset ?? [];
}

export const FORM_URL = "https://forms.hackclub.com/haven-website";
export const DOCS_URL = "https://github.com/hackclub/haven/blob/main/SITE_DATA.md";
