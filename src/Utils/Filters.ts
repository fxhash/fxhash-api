import { FilterOperator } from "type-graphql-filter"
import { FindConditions, FindOperator, Not, LessThan, MoreThan, Equal } from "typeorm"

function mapFilterOperatorTypeorm(operator: FilterOperator) {
  switch (operator) {
    case "eq": return Equal
    case "gt": return MoreThan
    case "lt": return LessThan
    default: return Equal
  }
}

export const processFilters = (filters: any) => {
  if (!filters) return {}

  let typeormFilters: Record<string, any> = {}

  for (const [filterKey, value] of Object.entries(filters)) {
    const [field, operator] = filterKey.split("_");

    console.log({ field, operator })
    typeormFilters[field] = mapFilterOperatorTypeorm(operator as FilterOperator)(value)
  }

  return typeormFilters
}