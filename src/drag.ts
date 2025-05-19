function registerDrag() {
  const element = document.getElementById('waifu');
  if (!element) return;
  let winWidth = window.innerWidth,
    winHeight = window.innerHeight;
  const imgWidth = element.offsetWidth,
    imgHeight = element.offsetHeight;
  // Bind mousedown event to the element to be dragged
  element.addEventListener('mousedown', event => {
    if (event.button === 2) {
      // Right mouse button, just return, do not handle
      return;
    }
    const canvas = document.getElementById('live2d');
    if (event.target !== canvas) return;
    event.preventDefault();
    // Record the coordinates of the cursor when pressing down on the image
    const _offsetX = event.offsetX,
      _offsetY = event.offsetY;
    // Bind mousemove event
    document.onmousemove = event => {
      // Get the coordinates of the cursor in the viewport
      const _x = event.clientX,
        _y = event.clientY;
      // Calculate the position of the dragged image
      let _left = _x - _offsetX,
        _top = _y - _offsetY;
      // Check if within the window range
      if (_top < 0) { // Top
        _top = 0;
      } else if (_top >= winHeight - imgHeight) { // Bottom
        _top = winHeight - imgHeight;
      }
      if (_left < 0) { // Left
        _left = 0;
      } else if (_left >= winWidth - imgWidth) { // Right
        _left = winWidth - imgWidth;
      }
      // Set the position of the element during dragging
      element.style.top = _top + 'px';
      element.style.left = _left + 'px';
    }
    // Bind mouseup event
    document.onmouseup = () => {
      document.onmousemove = null;
    }
  });
  // Reset width and height when the browser window size changes
  window.onresize = () => {
    winWidth = window.innerWidth;
    winHeight = window.innerHeight;
  }
}

export default registerDrag;
