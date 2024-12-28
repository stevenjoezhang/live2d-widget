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

export default randomSelection;
