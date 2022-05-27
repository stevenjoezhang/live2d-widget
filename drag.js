
		//待拖拽的元素
		let _img = document.getElementById('waifu');
		//获取元素与浏览器的宽高
		let winWidth = window.innerWidth,
			winHeight = window.innerHeight,
			imgWidth = _img.offsetWidth,
			imgHeight = _img.offsetHeight;
		//在待拖拽的元素上绑定鼠标按下事件
		_img.onmousedown = function(event) {
			//兼容IE
			event = event || window.event;
			//阻止浏览器默认行为兼容IE的写法
			event.preventDefault ? event.preventDefault() : event.returnValue = false;
			//记录光标在图片按下时的坐标
			let _offsetX = event.offsetX,
				_offsetY = event.offsetY;
			//绑定鼠标移动事件
			document.onmousemove = function(event) {
				//获取光标在可视窗口中的坐标
				let _x = event.clientX,
					_y = event.clientY;
				//计算拖动的图片的定位的位置
				let _left = _x - _offsetX,
					_top = _y - _offsetY;
				//判断是否在窗口范围内
				if (_top < 0) {	//上
					_top = 0;
				} else if (_top >= winHeight - imgHeight) {	//下
					_top = winHeight - imgHeight;
				}
				if (_left < 0) {	//左
					_left = 0;
				} else if (_left >= winWidth - imgWidth) {		//右
					_left = winWidth - imgWidth;
				}
				//设置拖动过程中图片的定位
				_img.style.top = _top + 'px';
				_img.style.left = _left + 'px';
			}
			//绑定鼠标弹起事件
			document.onmouseup = function() {
				document.onmousemove = null;
			}
		}
