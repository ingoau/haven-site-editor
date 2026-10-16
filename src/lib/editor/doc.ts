import { resolveSiteData } from "$lib/data/site";
import {
  siteDataInputSchema,
  siteDataJsonSchema,
  type SiteData,
  type SiteDataInput,
} from "$lib/data/types";
import { imageDefaults, imageKeys } from "$lib/data/images";
import { fontRoles, type FontSpec } from "$lib/data/fonts";

export type Path = (string | number)[];

/**
 * Everything a city page renders, fully filled in, so every field has a value
 * the editor can show. `meta.title` and `hero.signup.lang` use "" for "not set"
 * because they have no default text of their own.
 */
export type EditorDoc = Omit<SiteData, "title" | "meta" | "hero" | "fonts"> & {
  meta: { title: string; description: string; image: string };
  hero: Omit<SiteData["hero"], "signup"> & {
    signup: { placeholder: string; button: string; lang: string };
  };
  fonts: Record<"display" | "body", FontSpec>;
};

const clone = <T>(value: T): T => structuredClone(value);
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** What a city page shows when its JSON is `{}`. */
export function cityDefaults(): EditorDoc {
  return fromSiteData(resolveSiteData({}, { name: "" }));
}

function fromSiteData(site: SiteData): EditorDoc {
  const { title: _title, ...rest } = clone(site);
  return {
    ...rest,
    meta: { ...rest.meta, title: rest.meta.title ?? "" },
    hero: {
      ...rest.hero,
      signup: { ...rest.hero.signup, lang: rest.hero.signup.lang ?? "" },
    },
    fonts: {
      display: rest.fonts.display ?? { family: "", src: "" },
      body: rest.fonts.body ?? { family: "", src: "" },
    },
  };
}

export function fromInput(input: SiteDataInput): EditorDoc {
  return fromSiteData(resolveSiteData(input, { name: "" }));
}

/** Drop optional keys left blank, so `"href": ""` never reaches the form. */
function prune<T>(value: T, optional: string[]): T {
  if (Array.isArray(value)) return value.map((v) => prune(v, optional)) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(value)) {
      if (optional.includes(key) && (v === "" || v === false || v == null)) continue;
      if (key === "caption" && v && typeof v === "object") {
        const c = v as { title?: string; author?: string };
        if (!c.title && !c.author) continue;
      }
      out[key] = prune(v, optional);
    }
    return out as T;
  }
  return value;
}

const OPTIONAL = ["href", "mark", "position", "body", "src"];

/**
 * The smallest document that renders `doc`: only what differs from the
 * defaults. Haven freezes anything you include, so leaving untouched copy out
 * keeps it following the main site.
 */
export function toInput(doc: EditorDoc): Record<string, unknown> {
  const base = cityDefaults();
  const out: Record<string, any> = {};

  const section = (
    key: keyof EditorDoc,
    fields: string[],
    opts: { optional?: string[] } = {},
  ) => {
    const cur = doc[key] as Record<string, unknown>;
    const def = base[key] as Record<string, unknown>;
    const picked: Record<string, unknown> = {};
    for (const field of fields) {
      if (!same(cur[field], def[field])) {
        picked[field] = opts.optional ? prune(cur[field], opts.optional) : cur[field];
      }
    }
    if (Object.keys(picked).length) out[key] = picked;
  };

  const meta: Record<string, string> = {};
  if (doc.meta.title.trim()) meta.title = doc.meta.title;
  if (doc.meta.description !== base.meta.description) meta.description = doc.meta.description;
  if (doc.meta.image !== base.meta.image) meta.image = doc.meta.image;
  if (Object.keys(meta).length) out.meta = meta;

  section("nav", ["signup", "about", "faq"]);
  if (!same(doc.tagline, base.tagline)) out.tagline = doc.tagline;

  const hero: Record<string, unknown> = {};
  for (const f of ["organizeCta", "mapLabel", "scrollLabel"] as const) {
    if (doc.hero[f] !== base.hero[f]) hero[f] = doc.hero[f];
  }
  const signup: Record<string, string> = {};
  if (doc.hero.signup.placeholder !== base.hero.signup.placeholder)
    signup.placeholder = doc.hero.signup.placeholder;
  if (doc.hero.signup.button !== base.hero.signup.button) signup.button = doc.hero.signup.button;
  if (doc.hero.signup.lang.trim()) signup.lang = doc.hero.signup.lang.trim();
  if (Object.keys(signup).length) hero.signup = signup;
  if (Object.keys(hero).length) out.hero = hero;

  section("about", ["title", "body", "perks"], { optional: ["href", "position"] });
  section("pitch", ["heading", "items"], { optional: ["mark"] });
  section("steps", ["heading", "subheading", "cta"]);

  const schedule: Record<string, unknown> = {};
  if (doc.schedule.heading !== base.schedule.heading) schedule.heading = doc.schedule.heading;
  const tbd: Record<string, string> = {};
  if (doc.schedule.tbd.title !== base.schedule.tbd.title) tbd.title = doc.schedule.tbd.title;
  if (doc.schedule.tbd.body !== base.schedule.tbd.body) tbd.body = doc.schedule.tbd.body;
  if (Object.keys(tbd).length) schedule.tbd = tbd;
  if (doc.schedule.days.length) schedule.days = prune(doc.schedule.days, ["body"]);
  if (Object.keys(schedule).length) out.schedule = schedule;

  section("pastEvents", ["heading", "items", "safety"], { optional: ["href", "position"] });
  // pastEvents.items[].href is required, so put it back where prune removed it.
  if (out.pastEvents?.items) {
    out.pastEvents.items = (out.pastEvents.items as any[]).map((item, i) => ({
      ...item,
      href: doc.pastEvents.items[i]?.href ?? "",
    }));
  }

  const sponsors: Record<string, unknown> = {};
  if (doc.sponsors.heading !== base.sponsors.heading) sponsors.heading = doc.sponsors.heading;
  if (doc.sponsors.items.length) sponsors.items = doc.sponsors.items;
  if (Object.keys(sponsors).length) out.sponsors = sponsors;

  section("faq", ["heading", "cta", "items"], { optional: ["href"] });

  const footer: Record<string, unknown> = {};
  if (!same(doc.footer.body, base.footer.body)) footer.body = prune(doc.footer.body, ["href"]);
  const links: Record<string, string> = {};
  for (const [k, v] of Object.entries(doc.footer.links)) {
    if (v !== base.footer.links[k as keyof typeof base.footer.links]) links[k] = v;
  }
  if (Object.keys(links).length) footer.links = links;
  if (Object.keys(footer).length) out.footer = footer;

  const images: Record<string, string> = {};
  for (const key of imageKeys) {
    if (doc.images[key] && doc.images[key] !== imageDefaults[key]) images[key] = doc.images[key];
  }
  if (Object.keys(images).length) out.images = images;

  const fonts: Record<string, unknown> = {};
  for (const role of fontRoles) {
    const font = doc.fonts[role];
    if (!font?.family.trim()) continue;
    fonts[role] = font.src?.trim()
      ? { family: font.family.trim(), src: font.src.trim() }
      : font.family.trim();
  }
  if (Object.keys(fonts).length) out.fonts = fonts;

  return out;
}

export type Issue = { path: Path; message: string };

/** Runs Haven's own schema over the export, so what passes here passes there. */
export function validate(doc: EditorDoc): Issue[] {
  const result = siteDataInputSchema.safeParse(toInput(doc));
  if (result.success) return [];
  return result.error.issues.map((issue) => ({
    path: issue.path as Path,
    message: issue.message,
  }));
}

/** The file the editor exports also carries the preview-only city name. */
export type EditorFile = { eventName?: string; doc: EditorDoc };

/**
 * Accepts the JSON a city page was submitted with (what Export writes), or the
 * fuller `{ "haven-site-editor": 1, ... }` backup.
 */
export function parseImport(text: string): { ok: true; file: EditorFile } | { ok: false; error: string } {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    // Let Haven's parser explain it; it names curly quotes and the like.
  }
  if (raw && typeof raw === "object" && "haven-site-editor" in raw) {
    const wrapped = raw as { eventName?: string; site?: unknown };
    const result = siteDataJsonSchema.safeParse(wrapped.site ?? {});
    if (!result.success) return { ok: false, error: formatIssues(result.error.issues) };
    return { ok: true, file: { eventName: wrapped.eventName, doc: fromInput(result.data) } };
  }
  const result = siteDataJsonSchema.safeParse(text);
  if (!result.success) return { ok: false, error: formatIssues(result.error.issues) };
  return { ok: true, file: { doc: fromInput(result.data) } };
}

function formatIssues(issues: { path: PropertyKey[]; message: string }[]) {
  return issues
    .slice(0, 6)
    .map((i) => (i.path.length ? `${i.path.join(".")}: ${i.message}` : i.message))
    .join("\n");
}

export function getAt(obj: unknown, path: Path): any {
  return path.reduce<any>((o, k) => (o == null ? undefined : o[k]), obj);
}

/** Returns a copy of `obj` with `value` at `path`, sharing untouched branches. */
export function setAt<T>(obj: T, path: Path, value: unknown): T {
  if (path.length === 0) return value as T;
  const [head, ...rest] = path;
  const copy: any = Array.isArray(obj) ? [...obj] : { ...(obj as object) };
  copy[head] = setAt(copy[head], rest, value);
  return copy;
}

export const pathKey = (path: Path) => path.join(".");

export function isPrefix(prefix: Path, path: Path) {
  return prefix.length <= path.length && prefix.every((k, i) => path[i] === k);
}
