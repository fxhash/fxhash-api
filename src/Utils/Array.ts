export function arrayRemove<T = any>(array: T[], item: T) {
  const idx = array.indexOf(item)
  if (idx > -1) {
    array.splice(idx, 1)
  }
}

// Fisher-Yates shuffle
export function shuffle<T = any>(array: T[]) {
  const _array = [...array]
  // traverse array from end to start
  for (let i = _array.length - 1; i > 0; i--) {
    // random index from 0 to i
    let j = Math.floor(Math.random() * (i + 1))
    // swap elements array[i] and array[j]
    ;[_array[i], _array[j]] = [_array[j], _array[i]]
  }
  return _array
}
