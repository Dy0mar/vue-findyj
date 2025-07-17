export type ID = {
  readonly id: number;
};

export type PaginationQuery = {
  offset: number;
};

export type Paginated<T> = {
  items: T[];
  count: number;
};
