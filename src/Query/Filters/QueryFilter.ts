import type { SelectQueryBuilder } from "typeorm"

/**
 * A query filter takes a query and some filters, and apllies the filters
 * to the query.
 * @param query the query builder
 * @param filters an array of filter objects to apply
 */
export type TQueryFilter<Filters, Sort> = (
  query: SelectQueryBuilder<any>,
  filters: Filters,
  sort?: Sort,
) => Promise<SelectQueryBuilder<any>>