function registerDrag() {
    var element = document.getElementById('waifu');
    var canvas = document.getElementById('live2d');
    if (!element || !canvas)
        return;
    var winWidth = window.innerWidth, winHeight = window.innerHeight;
    var imgWidth = element.offsetWidth, imgHeight = element.offsetHeight;
    element.addEventListener('mousedown', function (event) {
        if (event.button === 2) {
            return;
        }
        if (event.target !== canvas)
            return;
        event.preventDefault();
        var _offsetX = event.offsetX, _offsetY = event.offsetY;
        document.onmousemove = function (event) {
            var _x = event.clientX, _y = event.clientY;
            var _left = _x - _offsetX, _top = _y - _offsetY;
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
        document.onmouseup = function () {
            document.onmousemove = null;
        };
    });
    window.onresize = function () {
        winWidth = window.innerWidth;
        winHeight = window.innerHeight;
    };
}
export default registerDrag;
