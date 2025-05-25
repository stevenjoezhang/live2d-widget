function randomSelection(obj) {
    return Array.isArray(obj) ? obj[Math.floor(Math.random() * obj.length)] : obj;
}
function randomOtherOption(total, excludeIndex) {
    const idx = Math.floor(Math.random() * (total - 1));
    return idx >= excludeIndex ? idx + 1 : idx;
}
function loadExternalResource(url, type) {
    return new Promise((resolve, reject) => {
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
export { randomSelection, loadExternalResource, randomOtherOption };
