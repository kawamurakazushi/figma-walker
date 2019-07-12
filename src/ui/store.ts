export interface Item {
  id: string;
  name: string;
}

export interface Store {
  search: string;
  selected: number;
  items: Item[];
}
