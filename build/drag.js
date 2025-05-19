function registerDrag() {
    const element = document.getElementById('waifu');
    if (!element)
        return;
    let winWidth = window.innerWidth, winHeight = window.innerHeight;
    const imgWidth = element.offsetWidth, imgHeight = element.offsetHeight;
    element.addEventListener('mousedown', event => {
        if (event.button === 2) {
            return;
        }
        const canvas = document.getElementById('live2d');
        if (event.target !== canvas)
            return;
        event.preventDefault();
        const _offsetX = event.offsetX, _offsetY = event.offsetY;
        document.onmousemove = event => {
            const _x = event.clientX, _y = event.clientY;
            let _left = _x - _offsetX, _top = _y - _offsetY;
            if (_top < 0) {
                _top = 0;
            }
            else if (_top >= winHeight - imgHeight) {
                _top = winHeight - imgHeight;
            }
            if (_left < 0) {
                _left = 0;
            }
            else if (_left >= winWidth - imgWidth) {
                _left = winWidth - imgWidth;
            }
            element.style.top = _top + 'px';
            element.style.left = _left + 'px';
        };
        document.onmouseup = () => {
            document.onmousemove = null;
        };
    });
    window.onresize = () => {
        winWidth = window.innerWidth;
        winHeight = window.innerHeight;
    };
}
export default registerDrag;
