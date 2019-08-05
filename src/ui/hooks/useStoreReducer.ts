import { useReducer } from "preact/hooks";

// Store

export interface Item {
  id: string;
  name: string;
  type: "PAGE" | "FRAME" | "COMPONENT" | "COMMAND";
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
const helpCmd = "?";

export type Mode = "jump" | "insert" | "help";

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

  if (modeSelector(store) === "help") {
    return [
      { id: "insert", name: "Insert Component", type: "COMMAND", page: "i" }
      // { id: "apply", name: "Apply Styles", type: "COMMAND", page: "a" }
    ];
  }

  if (modeSelector(store) === "insert") {
    return componentsSelector(store).filter(v => {
      return fuzzysearch(
        store.search.substr(insertCmd.length + 1).toLowerCase(),
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

  return "jump";
};

// Reducers

export const useStoreReducer = () =>
  useReducer<Store, Action>(
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
            search: action.mode === "insert" ? `${insertCmd} ` : ""
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
