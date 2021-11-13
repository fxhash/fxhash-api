// each pair of characters (as hex value) is associated to an int, and then to its utf-8 character
export function hexStringToString(str: string): string {
	return str.length > 1 ? String.fromCharCode.apply(null, str.match(/.{2}/g)!.map(hx => parseInt(hx, 16))) : ""
}

// each key of the array goes through hexStringToString
export function objectValuesHexToString(object: Record<string, string>): Record<string, string> {
  const r = { ...object }
  const keys = Object.keys(r)
  for (const k of keys) {
    r[k] = hexStringToString(r[k])
  }
  return r
}

export function bufferToJson(buffer: Buffer): Record<string, any> {
  const str = buffer.toString("utf-8").replace(/\0/g, '')
  return JSON.parse(str)
}

export function bytesToString(byteArray: number[]): string {
  return Array.from(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')
}

export function stringToByteString(str: string): string {
	const bytes: number[] = []
  for (let i = 0; i<str.length; i++) {
  	bytes.push(str.charCodeAt(i))
  }
  return bytesToString(bytes)
}