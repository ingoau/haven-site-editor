import {
  cityDefaults,
  getAt,
  isPrefix,
  pathKey,
  setAt,
  toInput,
  validate,
  type EditorDoc,
  type Path,
} from "./doc";
import { makeItem } from "./templates";

const STORAGE_KEY = "haven-site-editor:v1";
const HISTORY_LIMIT = 200;

type Saved = { version: 1; eventName: string; doc: EditorDoc; savedAt: string };

function load(): Saved | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Saved;
    if (saved?.version !== 1 || !saved.doc) return null;
    // Fill in anything a newer default added since this was saved.
    return { ...saved, doc: { ...cityDefaults(), ...saved.doc } };
  } catch {
    return null;
  }
}

class EditorStore {
  doc = $state<EditorDoc>(cityDefaults());
  eventName = $state("Your City");
  selected = $state<Path | null>(null);
  openFaq = $state(false);
  showHidden = $state(true);
  savedAt = $state<Date | null>(null);
  loaded = $state(false);

  #past: EditorDoc[] = [];
  #future: EditorDoc[] = [];
  #lastKey = "";
  #lastTime = 0;
  canUndo = $state(false);
  canRedo = $state(false);

  input = $derived(toInput(this.doc));
  json = $derived(JSON.stringify(this.input, null, 2));
  issues = $derived(validate(this.doc));

  init() {
    const saved = load();
    if (saved) {
      this.doc = saved.doc;
      this.eventName = saved.eventName;
      this.savedAt = new Date(saved.savedAt);
    }
    this.loaded = true;
  }

  persist() {
    try {
      const savedAt = new Date();
      const data: Saved = {
        version: 1,
        eventName: this.eventName,
        doc: $state.snapshot(this.doc) as EditorDoc,
        savedAt: savedAt.toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      this.savedAt = savedAt;
    } catch {
      // Storage full or blocked: the editor still works, it just won't remember.
    }
  }

  /**
   * Every change goes through here so it lands in the undo history. Typing in
   * one field keeps amending the same entry rather than one per keystroke.
   */
  #commit(next: EditorDoc, coalesceKey = "") {
    const now = Date.now();
    const coalesce = coalesceKey && coalesceKey === this.#lastKey && now - this.#lastTime < 1200;
    if (!coalesce) {
      this.#past.push($state.snapshot(this.doc) as EditorDoc);
      if (this.#past.length > HISTORY_LIMIT) this.#past.shift();
    }
    this.#future = [];
    this.#lastKey = coalesceKey;
    this.#lastTime = now;
    this.doc = next;
    this.#sync();
  }

  #sync() {
    this.canUndo = this.#past.length > 0;
    this.canRedo = this.#future.length > 0;
  }

  undo() {
    const prev = this.#past.pop();
    if (!prev) return;
    this.#future.push($state.snapshot(this.doc) as EditorDoc);
    this.doc = prev;
    this.#lastKey = "";
    this.#sync();
  }

  redo() {
    const next = this.#future.pop();
    if (!next) return;
    this.#past.push($state.snapshot(this.doc) as EditorDoc);
    this.doc = next;
    this.#lastKey = "";
    this.#sync();
  }

  get(path: Path) {
    return getAt(this.doc, path);
  }

  set(path: Path, value: unknown) {
    if (JSON.stringify(this.get(path)) === JSON.stringify(value)) return;
    this.#commit(setAt($state.snapshot(this.doc) as EditorDoc, path, value), pathKey(path));
  }

  /** Moves an item within a list or between two lists of the same kind. */
  move(from: Path, fromIndex: number, to: Path, toIndex: number) {
    let doc = $state.snapshot(this.doc) as EditorDoc;
    const source = [...(getAt(doc, from) as unknown[])];
    const [item] = source.splice(fromIndex, 1);
    if (item === undefined) return;
    const sameList = pathKey(from) === pathKey(to);
    if (sameList) {
      const at = toIndex > fromIndex ? toIndex - 1 : toIndex;
      if (at === fromIndex) return;
      source.splice(at, 0, item);
      doc = setAt(doc, from, source);
      this.#commit(doc);
      this.#retarget(from, fromIndex, to, at);
    } else {
      doc = setAt(doc, from, source);
      const target = [...(getAt(doc, to) as unknown[])];
      target.splice(toIndex, 0, item);
      doc = setAt(doc, to, target);
      this.#commit(doc);
      this.#retarget(from, fromIndex, to, toIndex);
    }
  }

  /** Keep the moved item selected at its new position. */
  #retarget(from: Path, fromIndex: number, to: Path, toIndex: number) {
    const sel = this.selected;
    if (sel && isPrefix([...from, fromIndex], sel)) {
      this.selected = [...to, toIndex, ...sel.slice(from.length + 1)];
    }
  }

  insert(list: Path, index: number, item: unknown) {
    const items = [...((this.get(list) as unknown[]) ?? [])];
    items.splice(index, 0, item);
    this.#commit(setAt($state.snapshot(this.doc) as EditorDoc, list, items));
  }

  add(list: Path, kind: string) {
    const length = (this.get(list) as unknown[] | undefined)?.length ?? 0;
    this.insert(list, length, makeItem(kind));
    this.selected = [...list, length];
  }

  duplicate(list: Path, index: number) {
    const item = structuredClone($state.snapshot(this.get([...list, index])));
    this.insert(list, index + 1, item);
    this.selected = [...list, index + 1];
  }

  remove(list: Path, index: number) {
    const items = [...(this.get(list) as unknown[])];
    items.splice(index, 1);
    this.#commit(setAt($state.snapshot(this.doc) as EditorDoc, list, items));
    if (this.selected && isPrefix([...list, index], this.selected)) this.selected = null;
  }

  /** Puts one section, or the whole page, back to Haven's defaults. */
  reset(section?: keyof EditorDoc) {
    const base = cityDefaults();
    if (!section) this.#commit(base);
    else this.#commit({ ...($state.snapshot(this.doc) as EditorDoc), [section]: base[section] });
  }

  replace(doc: EditorDoc, eventName?: string) {
    this.#commit(doc);
    if (eventName) this.eventName = eventName;
    this.selected = null;
  }
}

export const editor = new EditorStore();
