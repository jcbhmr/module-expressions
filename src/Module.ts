import createDataOrBlobURL from "./internal/createDataOrBlobURL.js"

export default class Module<T extends Record<string, any>> {
  #sourceText: string
  #selfURL: string | null | undefined
  constructor(sourceText: string) {
    this.#sourceText = sourceText
  }

  [Symbol.toPrimitive](hint: "default" | "number" | "string"): string {
    if (hint === "string") {
      return this.#selfURL ??= createDataOrBlobURL(this.#sourceText, "text/javascript")
    } else {
      return this.#sourceText
    }
  }

  toString() {
    return this.#sourceText
  }
}
