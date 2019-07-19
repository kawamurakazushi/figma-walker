import { useReducer } from "preact/hooks";

// Store

export interface Item {
  id: string;
  name: string;
  type: "PAGE" | "FRAME" | "COMPONENT";
  page: string | null;
}

export interface Store {
  search: string;
  selected: number;
  items: Item[];
  loading: boolean;
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

export type Action =
  | InputSearchAction
  | NextAction
  | PrevAction
  | GoToAction
  | SetItemsAction;

// Selectors

const insertCmd = "i";

export type Mode = "jump" | "insert";

export const filterItemsSelector = (store: Store): Item[] => {
  if (modeSelector(store) === "insert") {
    return componentsSelector(store).filter(v =>
      v.name
        .toLowerCase()
        .includes(store.search.substr(insertCmd.length + 1).toLowerCase())
    );
  }

  return store.items.filter(v =>
    v.name.toLowerCase().includes(store.search.toLowerCase())
  );
};

export const componentsSelector = (store: Store): Item[] =>
  store.items.filter(v => v.type === "COMPONENT");

export const modeSelector = (store: Store): Mode => {
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

        default:
          return state;
      }
    },
    {
      search: "",
      selected: 0,
      items: [],
      loading: true
    }
  );
