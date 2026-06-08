import { useReducer, useCallback } from "react";
import type { Target, Size, Template } from "~/lib/schemas";

/**
 * A template being authored. Structurally a {@link Template} (canonical
 * camelCase — so it round-trips straight into the generator and YAML codec)
 * but allowed to be transiently invalid during editing, e.g. zero targets.
 */
export interface DraftTemplate {
  name: string;
  size: Size;
  file: string;
  targets: Target[];
}

interface EditorState {
  past: DraftTemplate[];
  present: DraftTemplate;
  future: DraftTemplate[];
}

type Action =
  | { type: "load"; template: DraftTemplate } // resets undo history
  | { type: "setName"; name: string } // metadata: not undoable
  | { type: "setFile"; file: string } // metadata: not undoable
  | { type: "setSize"; size: Size } // metadata: not undoable
  | { type: "addTarget"; target: Target }
  | { type: "removeTarget"; index: number }
  | { type: "updateTarget"; index: number; target: Target }
  | { type: "undo" }
  | { type: "redo" };

const MAX_HISTORY = 50;

/** Pushes the current present onto the undo stack and sets a new present. */
function commit(state: EditorState, next: DraftTemplate): EditorState {
  return {
    past: [...state.past, state.present].slice(-MAX_HISTORY),
    present: next,
    future: [],
  };
}

/** Replaces present without touching history (for non-undoable metadata). */
function replace(state: EditorState, next: DraftTemplate): EditorState {
  return { ...state, present: next };
}

function reducer(state: EditorState, action: Action): EditorState {
  const { present } = state;
  switch (action.type) {
    case "load":
      return { past: [], present: action.template, future: [] };
    case "setName":
      return replace(state, { ...present, name: action.name });
    case "setFile":
      return replace(state, { ...present, file: action.file });
    case "setSize":
      return replace(state, { ...present, size: action.size });
    case "addTarget":
      return commit(state, {
        ...present,
        targets: [...present.targets, action.target],
      });
    case "removeTarget":
      return commit(state, {
        ...present,
        targets: present.targets.filter((_, i) => i !== action.index),
      });
    case "updateTarget":
      return commit(state, {
        ...present,
        targets: present.targets.map((t, i) =>
          i === action.index ? action.target : t,
        ),
      });
    case "undo": {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
      };
    }
    case "redo": {
      if (state.future.length === 0) return state;
      const [next, ...rest] = state.future;
      return {
        past: [...state.past, state.present],
        present: next,
        future: rest,
      };
    }
    default:
      return state;
  }
}

export interface TemplateEditor {
  template: DraftTemplate;
  canUndo: boolean;
  canRedo: boolean;
  load: (template: DraftTemplate) => void;
  setName: (name: string) => void;
  setFile: (file: string) => void;
  setSize: (size: Size) => void;
  addTarget: (target: Target) => void;
  removeTarget: (index: number) => void;
  updateTarget: (index: number, target: Target) => void;
  undo: () => void;
  redo: () => void;
}

/** Copies a canonical Template into an editable draft (deep-ish clone). */
export function fromTemplate(template: Template): DraftTemplate {
  return {
    name: template.name,
    size: { ...template.size },
    file: template.file,
    targets: template.targets.map((t) => ({
      friendlyName: t.friendlyName,
      topLeft: { ...t.topLeft },
      size: { ...t.size },
      ...(t.deltas && { deltas: t.deltas.map((d) => ({ ...d })) as Target["deltas"] }),
    })),
  };
}

export function useTemplateEditor(initial: DraftTemplate): TemplateEditor {
  const [state, dispatch] = useReducer(reducer, {
    past: [],
    present: initial,
    future: [],
  });

  return {
    template: state.present,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    load: useCallback((template) => dispatch({ type: "load", template }), []),
    setName: useCallback((name) => dispatch({ type: "setName", name }), []),
    setFile: useCallback((file) => dispatch({ type: "setFile", file }), []),
    setSize: useCallback((size) => dispatch({ type: "setSize", size }), []),
    addTarget: useCallback((target) => dispatch({ type: "addTarget", target }), []),
    removeTarget: useCallback(
      (index) => dispatch({ type: "removeTarget", index }),
      [],
    ),
    updateTarget: useCallback(
      (index, target) => dispatch({ type: "updateTarget", index, target }),
      [],
    ),
    undo: useCallback(() => dispatch({ type: "undo" }), []),
    redo: useCallback(() => dispatch({ type: "redo" }), []),
  };
}
