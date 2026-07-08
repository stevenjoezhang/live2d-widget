/**
 * @file Contains utility functions.
 * @module utils
 */

/**
 * Randomly select an element from an array, or return the original value if not an array.
 * @param {string[] | string} obj - The object or array to select from.
 * @returns {string} The randomly selected element or the original value.
 */
function randomSelection(obj: string[] | string): string {
  return Array.isArray(obj) ? obj[Math.floor(Math.random() * obj.length)] : obj;
}

function randomOtherOption(total: number, excludeIndex: number): number {
  const idx = Math.floor(Math.random() * (total - 1));
  return idx >= excludeIndex ? idx + 1 : idx;
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

/**
 * Escape HTML special characters to prevent XSS attacks.
 * @param {string} str - The string to escape.
 * @returns {string} The escaped string safe for innerHTML insertion.
 */
function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return str.replace(/[&<>"']/g, c => map[c]);
}

export { randomSelection, loadExternalResource, randomOtherOption, escapeHtml };
