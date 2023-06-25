import createContentURL from "#/internal/createContentURL.js";

export default class Module {
  #sourceText;
  #contentURL;
  constructor(sourceText, contentURL) {
    this.#sourceText = sourceText;
    this.#contentURL = contentURL;
  }

  [Symbol.toPrimitive](hint) {
    if (hint === "string") {
      return this.#contentURL;
    } else {
      return this.#sourceText;
    }
  }

  toString() {
    return this.#sourceText;
  }
}
