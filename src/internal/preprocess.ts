export default function preprocess(importMeta: ImportMeta, expression: string, id: string): string {
  // if (/__glob__\d+_\d+/g.test(expression)) {
  //   if (typeof process !== "undefined") {
  //     process.emitWarning("import.meta.glob(..., { eager: true }) is not supported");
  //   } else {
  //     console.warn("import.meta.glob(..., { eager: true }) is not supported");
  //   }
  // }

  expression = expression.replaceAll(/(\W)import\(/g, "$1__import__(");
  expression = expression.replace(/(\W)import\.meta/g, "$1__importMeta__");

  // expression = expression.replace(/(\W)__vite_ssr_dynamic_import__\(/g, "$1__import__(");
  // expression = expression.replace(/(\W)__vite_ssr_import_meta__/g, "$1__importMeta__");

  // expression = expression.replace(
  //   /(\W)h\(\(\)=>import\("(.*?)"\),(\[.*?\])\)/g,
  //   '$1__import__("$2")'
  // );

  return expression;
}
