import type { EditorDoc, Path } from "./doc";

/** Editor → preview frame. */
export type ToPreview =
  | {
      type: "state";
      doc: EditorDoc;
      eventName: string;
      selected: Path | null;
      openFaq: boolean;
      showHidden: boolean;
    }
  | { type: "scroll"; target: string }
  /** Bring the element for `path` (or its nearest ancestor) into view. */
  | { type: "reveal"; path: Path };

/** Preview frame → editor. */
export type FromPreview =
  | { type: "ready" }
  | { type: "set"; path: Path; value: unknown }
  | { type: "select"; path: Path | null }
  | { type: "move"; from: Path; fromIndex: number; to: Path; toIndex: number }
  | { type: "remove"; list: Path; index: number }
  | { type: "duplicate"; list: Path; index: number }
  | { type: "add"; list: Path; kind: string }
  | { type: "history"; action: "undo" | "redo" }
  | { type: "visible"; section: string };
