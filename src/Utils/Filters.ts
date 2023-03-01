import { FilterOperator } from "type-graphql-filter"
import {
  FindConditions,
  FindOperator,
  Not,
  LessThan,
  MoreThan,
  Equal,
  In,
  MoreThanOrEqual,
  LessThanOrEqual,
  IsNull,
} from "typeorm"
import { Article } from "../Entity/Article"
import { GenerativeToken } from "../Entity/GenerativeToken"
import { Listing } from "../Entity/Listing"
import { Objkt } from "../Entity/Objkt"
import { User } from "../Entity/User"
import { FeatureFilter, FeatureType } from "../Resolver/Arguments/Filter"

function mapFilterOperatorTypeorm(operator: FilterOperator, value: any) {
  switch (operator) {
    case "eq":
      return Equal
    case "ne":
      return Not
    case "gt":
      return MoreThan
    case "gte":
      return MoreThanOrEqual
    case "lt":
      return LessThan
    case "lte":
      return LessThanOrEqual
    case "in":
      return In
    case "exist":
      return value ? () => Not(IsNull()) : IsNull
    default:
      return Equal
  }
}

export const processFilters = (filters: any) => {
  if (!filters) return {}

  let typeormFilters: Record<string, any> = {}

  for (const [filterKey, value] of Object.entries(filters)) {
    const [field, operator] = filterKey.split("_")
    typeormFilters[field] = mapFilterOperatorTypeorm(
      operator as FilterOperator,
      value
    )(value as any)
  }

  return typeormFilters
}

/**
 * Generic purpose method to process filters for an endpoint, only allowing a list of
 * filters to go through the endpoint
 */
export const processSelectiveFilters = (
  filters: Record<string, any>,
  allowed: string[] = []
) => {
  if (!filters) return []

  let typeormFilters: Record<string, any>[] = []

  for (const [filterKey, value] of Object.entries(filters)) {
    const [field, operator] = filterKey.split("_")

    // if the field is in the db fields allowed, add it
    if (allowed.includes(field)) {
      typeormFilters.push({
        [field]: mapFilterOperatorTypeorm(
          operator as FilterOperator,
          value
        )(value as any),
      })
    }
  }

  return typeormFilters
}

const listingFiltersDbFields: (keyof Listing)[] = [
  "price",
  "createdAt",
  "cancelledAt",
  "acceptedAt",
]

/**
 * This method processes the listings filters which can be run against the DB
 * fields.
 * If a filter doesn't target a DB field, it will be ignored by this method
 */
export const processListingFilters = (filters: any) => {
  return processSelectiveFilters(filters, listingFiltersDbFields)
}

const generativeFiltersDbFields: (keyof GenerativeToken)[] = ["supply", "flag"]

/**
 * This method processes the offer filters which can be run against the DB fields.
 * If a filter doesn't target a DB field, it will be ignored by this method
 */
export const processGenerativeFilters = (filters: any = {}) => {
  return processSelectiveFilters(filters, generativeFiltersDbFields)
}

const userFiltersDbFields: (keyof User)[] = ["id", "flag"]
export const processUserFilters = (filters: any) => {
  return processSelectiveFilters(filters, userFiltersDbFields)
}

const objktFiltersDbFields: (keyof Objkt)[] = [
  "assigned",
  "createdAt",
  "assignedAt",
]
export const processObjktFilters = (filters: any) => {
  return processSelectiveFilters(filters, objktFiltersDbFields)
}

const articleFiltersDbFields: (keyof Article)[] = [
  "author",
  "metadataLocked",
  "editions",
  "royalties",
  "flag",
]
export const processArticleFilters = (filters: any) => {
  return processSelectiveFilters(filters, articleFiltersDbFields)
}

/**
 * For each feature filtered, returns an array of json filters that can be applied
 * to a OR condition in a psql WHERE clause.
 */
export function processGentkFeatureFilters(
  filters: FeatureFilter[]
): string[][] {
  const processed: string[][] = []
  for (const filter of filters) {
    const values: string[] = []
    for (const value of filter.values) {
      if (
        filter.type === FeatureType.BOOLEAN ||
        filter.type === FeatureType.NUMBER
      ) {
        values.push(`[{"name": "${filter.name}", "value": ${value}}]`)
      } else if (filter.type === FeatureType.STRING) {
        values.push(`[{"name": "${filter.name}", "value": "${value}"}]`)
      }
    }
    processed.push(values)
  }
  return processed
}
