import { Item } from "./store";

interface InputSearchAction {
  type: "INPUT_SEARCH";
  value: string;
}

interface NextAction {
  type: "NEXT";
}

interface PrevAction {
  type: "PREV";
}

interface GoToAction {
  type: "GO_TO";
  index: number;
}

interface GoToAction {
  type: "GO_TO";
  index: number;
}

interface SetItemsAction {
  type: "SET_ITEMS";
  items: Item[];
}

export type Action =
  | InputSearchAction
  | NextAction
  | PrevAction
  | GoToAction
  | SetItemsAction;
