$("<link>").attr({href: "https://www.example.com/path/to/waifu.css", rel: "stylesheet", type: "text/css"}).appendTo('head');
//waifu.css的绝对路径

$.ajax({
	url: 'https://www.example.com/path/to/live2d.min.js',
	dataType:"script",
	cache: true,
	async: false
});
//live2d.min.js的绝对路径

$.ajax({
	url: 'https://www.example.com/path/to/waifu-tips.js',
	dataType:"script",
	cache: true,
	async: false
});
//waifu-tips.js的绝对路径

// 初始化看板娘，会自动加载指定目录下的 waifu-tips.json
$(window).on("load", function() {
	initWidget("/lib/waifu/", "https://api.fghrsh.net/live2d");
});
//initWidget第一个参数为waifu-tips.json所在的文件夹，第二个参数为api地址
//api后端可自行搭建，参考https://github.com/fghrsh/live2d_api
