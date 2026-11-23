export interface SortParam {
  field: string;
  direction: "asc" | "desc";
}

export interface PaginatedQuery<TFilter = Record<string, unknown>> {
  page: number;
  pageSize: number;
  search?: string;
  sort?: SortParam;
  filters?: TFilter;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
