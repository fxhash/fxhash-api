import { UserCollectionSortInput } from "../Resolver/Arguments/Sort"

type SortKey<T> = keyof T

interface SortTableLevels<T> {
  primaryTable: Partial<T>
  secondaryTable: Partial<T>
}

/**
 * Given a SortInput of a certain type, outputs an object with 2 properties:
 * - primary table: an object with the keys that can be run on the primary table
 * - secondary table: an object with the keys that can be run on a secondary table
 * (or with different heuristic)
 */
export function sortTableLevels<T>(sortInput: T, primarySortKeys: SortKey<T>[]): SortTableLevels<T> {
  const sortsPrimary: Partial<T> = {}
  const sortsSecondary: Partial<T> = {}
  for (const k in sortInput) {
    if (primarySortKeys.includes(k)) {
      sortsPrimary[k] = sortInput[k]
    }
    else {
      sortsSecondary[k] = sortInput[k]
    }
  }
  return {
    primaryTable: sortsPrimary,
    secondaryTable: sortsSecondary,
  }
}

const userCollectionPrimaryKeys: SortKey<UserCollectionSortInput>[] = [
  "assignedAt",
  "id",
  "rarity"
]
export function userCollectionSortTableLevels(sortInput: UserCollectionSortInput): SortTableLevels<UserCollectionSortInput> {
  return sortTableLevels(sortInput, userCollectionPrimaryKeys)
}