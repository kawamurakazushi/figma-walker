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
}
