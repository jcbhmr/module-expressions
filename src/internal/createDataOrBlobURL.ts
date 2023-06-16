export default function createDataOrBlobURL(body: string, type: string): string {
  if (Object.getOwnPropertySymbols(globalThis.EventTarget ?? {}).length) {
    return `data:${type},${encodeURIComponent(body)}`
  } else if (URL.createObjectURL) {
    return URL.createObjectURL(new Blob([body], { type }))
  } else {
    return `data:${type},${encodeURIComponent(body)}`
  }
}
