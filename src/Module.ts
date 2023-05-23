/**
 * We are abusing String objects here to make it so that the `Module` object is
 * an actual object that can have properties and methods, but also will
 * cooperate with serialization when crossing realms. This is because the String
 * class is serialized as though it were a regular string primitive! We can
 * abuse this to stash our raw `data:` or `blob:` URL in the String object as
 * its primitive value, and then reset the prototype to our own `Module` class.
 *
 * @file
 * @example
 *   class C {}
 *   const string = new String("hello world");
 *   Object.setPrototypeOf(string, C.prototype);
 *   console.log(string instanceof String);
 *   //=> false
 *   console.log(string instanceof C);
 *   //=> true
 *   const worker = new Worker("data:text/javascript,onmessage=console.log");
 *   worker.postMessage(string);
 *   //=> "hello world"
 */

declare global {
  // @ts-ignore
  var Worker: {
    new (scriptURL: string | URL, options?: WorkerOptions): Worker;
    new <T extends {}>(
      scriptURL: Module<T>,
      options: WorkerOptions & { type: "module" }
    ): Worker;
    prototype: Worker;
  };
}

const sourceText = new WeakMap<Module<{}>, string>();
const dataURL = new WeakMap<Module<{}>, string>();
function createModule<T extends {}>(
  sourceText_: string,
  dataURL_: string
): Module<T> {
  const module = new String(dataURL_) as unknown as Module<T>;
  Object.setPrototypeOf(module, Module.prototype);

  sourceText.set(module, sourceText_);
  dataURL.set(module, dataURL_);

  return module;
}
class Module<T extends {}> {
  private constructor() {}

  [Symbol.toPrimitive](hint: "default" | "number" | "string") {
    // The hint is "string" when using import(), and that's really all we care
    // about. The .postMessage() and structuredClone() will just use the
    // underlying primitive value which was set in the createModule() function.
    if (hint === "string") {
      return dataURL.get(this)!;
    } else {
      return sourceText.get(this)!;
    }
  }

  toString() {
    return sourceText.get(this)!;
  }
}

// https://stackoverflow.com/a/50924506
type ModuleExports<T> = T extends Module<infer X> ? X : never;

export default Module;
export { createModule, ModuleExports };
