/**
 * @file 包含实用工具函数。
 * @module utils
 */

/**
 * 从数组中随机选择一个元素，或返回原始值（如果不是数组）。
 * @param {any} obj - 要选择的对象或数组。
 * @returns {any} 随机选择的元素或原始值。
 */
function randomSelection(obj: any) {
  return Array.isArray(obj) ? obj[Math.floor(Math.random() * obj.length)] : obj;
}

/**
 * 异步加载外部资源。
 * @param {string} url - 资源路径。
 * @param {string} type - 资源类型。
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
