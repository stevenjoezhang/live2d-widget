function randomSelection(obj) {
    return Array.isArray(obj) ? obj[Math.floor(Math.random() * obj.length)] : obj;
}

/**
 * 文件加载器
 */
export async function loadJsonFile(path) {
    // 浏览器环境
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

export default randomSelection;
