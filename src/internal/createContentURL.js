/**
 * @param {string} body
 * @param {string} type
 * @returns {string}
 */
export default function createContentURL(body, type) {
  if (URL.createObjectURL) {
    return URL.createObjectURL(new Blob([body], { type }));
  } else {
    return `data:${type},${encodeURIComponent(body)}`;
  }
}
