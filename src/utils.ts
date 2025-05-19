/**
 * @file Contains utility functions.
 * @module utils
 */

/**
 * Randomly select an element from an array, or return the original value if not an array.
 * @param {any} obj - The object or array to select from.
 * @returns {any} The randomly selected element or the original value.
 */
function randomSelection(obj: any) {
  return Array.isArray(obj) ? obj[Math.floor(Math.random() * obj.length)] : obj;
}

/**
 * Asynchronously load external resources.
 * @param {string} url - Resource path.
 * @param {string} type - Resource type.
 */
function loadExternalResource(url: string, type: string): Promise<string> {
  return new Promise((resolve: any, reject: any) => {
    let tag;

    if (type === 'css') {
      tag = document.createElement('link');
      tag.rel = 'stylesheet';
      tag.href = url;
    }
    else if (type === 'js') {
      tag = document.createElement('script');
      tag.src = url;
    }
    if (tag) {
      tag.onload = () => resolve(url);
      tag.onerror = () => reject(url);
      document.head.appendChild(tag);
    }
  });
}

export { randomSelection, loadExternalResource };
