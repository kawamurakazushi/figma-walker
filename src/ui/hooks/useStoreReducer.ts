import { useReducer } from "react";

// Store

export interface Item {
  id: string;
  name: string;
  type: "PAGE" | "FRAME" | "COMPONENT" | "insert" | "create";
  page: string | null;
}

export interface Store {
  search: string;
  selected: number;
  items: Item[];
  loading: boolean;
  scrollTop: number;
}

// Actions

export interface InputSearchAction {
  type: "INPUT_SEARCH";
  value: string;
}

export interface NextAction {
  type: "NEXT";
}

export interface PrevAction {
  type: "PREV";
}

export interface GoToAction {
  type: "GO_TO";
  index: number;
}

export interface GoToAction {
  type: "GO_TO";
  index: number;
}

export interface SetItemsAction {
  type: "SET_ITEMS";
  items: Item[];
}

export interface SetModeAction {
  type: "SET_MODE";
  mode: Mode;
}

export interface SetScrollTopAction {
  type: "SET_SCROLL_TOP";
  scrollTop: number;
}

export type Action =
  | InputSearchAction
  | NextAction
  | PrevAction
  | GoToAction
  | SetItemsAction
  | SetModeAction
  | SetScrollTopAction;

// Selectors

const insertCmd = "i";
const createCmd = "c";
const helpCmd = "?";

export type Mode = "jump" | "insert" | "help" | "create";

export const inputSelector = (store: Store) => (mode: Mode) => {
  const length =
    mode === "insert"
      ? insertCmd.length + 1
      : mode === "create"
      ? createCmd.length + 1
      : 0;
  return store.search.substr(length);
};

export const filterItemsSelector = (store: Store): Item[] => {
  const fuzzysearch = (needle: string, haystack: string) => {
    const hlen = haystack.length;
    const nlen = needle.length;
    if (nlen > hlen) {
      return false;
    }

    if (nlen === hlen) {
      return needle === haystack;
    }

    outer: for (let i = 0, j = 0; i < nlen; i++) {
      let nch = needle.charCodeAt(i);
      while (j < hlen) {
        if (haystack.charCodeAt(j++) === nch) {
          continue outer;
        }
      }
      return false;
    }

    return true;
  };

  const mode = modeSelector(store);

  if (mode === "help") {
    return [
      { id: "insert", name: "Insert Component", type: "insert", page: "i" },
      {
        id: "create",
        name: "Create Component / Styles",
        type: "create",
        page: "c"
      }
    ];
  }

  if (mode === "create") {
    const name = inputSelector(store)("create");

    return [
      {
        id: "create_component",
        name: "Create Component named " + (name === "" ? "..." : name),
        type: "create",
        page: ""
      }
      // {
      // //   // id: "create_style",
      //   // name: "Create Component / Styles",
      //   // type: "create",
      //   // page: "c"
      // }
    ];
  }

  if (modeSelector(store) === "insert") {
    return componentsSelector(store).filter(v => {
      return fuzzysearch(
        inputSelector(store)("insert").toLowerCase(),
        v.name.toLowerCase()
      );
    });
  }

  return store.items.filter(v => {
    return fuzzysearch(store.search.toLowerCase(), v.name.toLowerCase());
  });
};

export const componentsSelector = (store: Store): Item[] =>
  store.items.filter(v => v.type === "COMPONENT");

export const modeSelector = (store: Store): Mode => {
  if (store.search.indexOf(helpCmd) == 0) {
    return "help";
  }

  if (store.search.indexOf(`${insertCmd} `) == 0) {
    return "insert";
  }

  if (store.search.indexOf(`${createCmd} `) == 0) {
    return "create";
  }

  return "jump";
};

const selectedItemSelector = (store: Store) => {
  const items = filterItemsSelector(store);
  const selected = store.selected;

  return items[selected];
};

// Side Effects

export const send = (store: Store, dispatch: (action: Action) => void) => {
  const item = selectedItemSelector(store);
  const mode = modeSelector(store);

  if (item) {
    switch (mode) {
      case "help": {
        if (item.type === "insert" || item.type === "create") {
          dispatch({ type: "SET_MODE", mode: item.type });
        }
        return;
      }

      case "create": {
        const name = inputSelector(store)("create");
        parent.postMessage(
          {
            pluginMessage: { type: "CREATE_COMPONENT", name }
          },
          "*"
        );
        return;
      }

      case "jump": {
        parent.postMessage(
          {
            pluginMessage: { type: "JUMP", id: item.id }
          },
          "*"
        );
        return;
      }
      case "insert": {
        parent.postMessage(
          {
            pluginMessage: { type: "INSERT", id: item.id }
          },
          "*"
        );
        return;
      }
    }
  }
};

// Reducers

export const useStoreReducer = () =>
  useReducer(
    (state, action) => {
      switch (action.type) {
        case "INPUT_SEARCH":
          return {
            ...state,
            search: action.value,
            selected: 0
          };

        case "NEXT": {
          return state.selected >= filterItemsSelector(state).length - 1
            ? { ...state, selected: 0 }
            : {
                ...state,
                selected: state.selected + 1
              };
        }

        case "PREV": {
          if (state.selected > 0) {
            return {
              ...state,
              selected: state.selected - 1
            };
          }

          return state;
        }

        case "GO_TO": {
          return {
            ...state,
            selected: action.index
          };
        }

        case "SET_ITEMS": {
          return {
            ...state,
            items: [...state.items, ...action.items],
            loading: false
          };
        }

        case "SET_SCROLL_TOP": {
          return {
            ...state,
            scrollTop: action.scrollTop
          };
        }

        case "SET_MODE": {
          return {
            ...state,
            search:
              action.mode === "insert"
                ? `${insertCmd} `
                : action.mode === "create"
                ? `${createCmd} `
                : ""
          };
        }

        default:
          return state;
      }
    },
    {
      search: "",
      selected: 0,
      items: [],
      loading: true,
      scrollTop: 0
    }
  );
