export function arrayRemove<T = any>(array: T[], item: T) {
  const idx = array.indexOf(item)
  if (idx > -1) {
    array.splice(idx, 1)
  }
}