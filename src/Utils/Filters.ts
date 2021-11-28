import { FilterOperator } from "type-graphql-filter"
import { FindConditions, FindOperator, Not, LessThan, MoreThan, Equal, In } from "typeorm"

function mapFilterOperatorTypeorm(operator: FilterOperator) {
  switch (operator) {
    case "eq": return Equal
    case "ne": return Not
    case "gt": return MoreThan
    case "lt": return LessThan
    case "in": return In
    default: return Equal
  }
}

export const processFilters = (filters: any) => {
  if (!filters) return {}

  let typeormFilters: Record<string, any> = {}

  for (const [filterKey, value] of Object.entries(filters)) {
    const [field, operator] = filterKey.split("_")
    typeormFilters[field] = mapFilterOperatorTypeorm(operator as FilterOperator)(value as any)
  }

  return typeormFilters
}