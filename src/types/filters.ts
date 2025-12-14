export interface Filters {
  name: string;
  types: string[];
  onlyCaught?: boolean;
}

export type ViewMode = "grid" | "table";
