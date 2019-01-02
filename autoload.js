const live2d_path = "https://cdn.jsdelivr.net/gh/stevenjoezhang/live2d-widget/";

$("<link>").attr({href: live2d_path + "waifu.css", rel: "stylesheet", type: "text/css"}).appendTo("head");
//waifu.css的绝对路径

$.ajax({
	url: live2d_path + "live2d.min.js",
	dataType: "script",
	cache: true,
	async: false
});
//live2d.min.js的绝对路径

$.ajax({
	url: live2d_path + "waifu-tips.js",
	dataType: "script",
	cache: true,
	async: false
});
//waifu-tips.js的绝对路径

//初始化看板娘，会自动加载指定目录下的 waifu-tips.json
$(window).on("load", function() {
	initWidget(live2d_path + "waifu-tips.json", "https://live2d.fghrsh.net/api");
});
//initWidget第一个参数为waifu-tips.json的绝对路径
//第二个参数为api地址（无需修改）
//api后端可自行搭建，参考https://github.com/fghrsh/live2d_api
