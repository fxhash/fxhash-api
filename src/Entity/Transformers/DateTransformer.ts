/**
 * Ensures that Dates are transformed into strings, so that Redis can serialize those properly
 * into the cache and return a normalized string to the client when cache hits again
 */
export const DateTransformer = {
  to: (value: string) => {
    return value
  },
  from: (value: Date|string|null) => {
    return !value ? null : (typeof value === "string" ? value : value.toISOString())
  }
}