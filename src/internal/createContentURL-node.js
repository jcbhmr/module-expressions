export default function createContentURL(body, type) {
  // https://github.com/nodejs/node/issues/46557
  return `data:${type},${encodeURIComponent(body)}`;
}
