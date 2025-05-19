function registerDrag() {
  const element = document.getElementById('waifu');
  if (!element) return;
  let winWidth = window.innerWidth,
    winHeight = window.innerHeight;
  const imgWidth = element.offsetWidth,
    imgHeight = element.offsetHeight;
  // 在待拖拽的元素上绑定鼠标按下事件
  element.addEventListener('mousedown', event => {
    if (event.button === 2) {
      // 右键，直接返回，不处理
      return;
    }
    const canvas = document.getElementById('live2d');
    if (event.target !== canvas) return;
    event.preventDefault()
    // 记录光标在图片按下时的坐标
    const _offsetX = event.offsetX,
      _offsetY = event.offsetY;
    // 绑定鼠标移动事件
    document.onmousemove = event => {
      // 获取光标在可视窗口中的坐标
      const _x = event.clientX,
        _y = event.clientY;
      // 计算拖动的图片的定位的位置
      let _left = _x - _offsetX,
        _top = _y - _offsetY;
      // 判断是否在窗口范围内
      if (_top < 0) { // 上
        _top = 0;
      } else if (_top >= winHeight - imgHeight) { // 下
        _top = winHeight - imgHeight;
      }
      if (_left < 0) { // 左
        _left = 0;
      } else if (_left >= winWidth - imgWidth) { // 右
        _left = winWidth - imgWidth;
      }
      // 设置拖动过程中元素的定位
      element.style.top = _top + 'px';
      element.style.left = _left + 'px';
    }
    // 绑定鼠标弹起事件
    document.onmouseup = () => {
      document.onmousemove = null;
    }
  });
  // 当浏览器的窗口大小被改变时重设宽高
  window.onresize = () => {
    winWidth = window.innerWidth;
    winHeight = window.innerHeight;
  }
}

export default registerDrag;
