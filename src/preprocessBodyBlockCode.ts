function preprocessBodyBlockCode(b: string): string {
  b = b.replaceAll("import(", "__import(");
  return b;
}
