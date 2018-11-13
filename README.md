# live2d-widget

## 功能
在网页中添加Live2D看板娘

## Demo
在[米米的博客](https://zhangshuqiao.org)的左下角可查看效果

## 依赖
需要jQuery和font-awesome支持，请确保它们已在页面中加载，例如在`<header>`中加入：
```
<script src="https://cdn.jsdelivr.net/npm/jquery@3.3.1/dist/jquery.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css">
```

## 使用
请把整个项目克隆到服务器上，使之能够正常访问。修改autoload.js中的参数（具体参考该文件内的注释），这样，通过
```
<script src="/path/to/autoload.js"></script>
```
就可以加载了。

waifu-tips.json中包含了触发条件（selector，选择器）和触发时显示的文字（text）。源文件是对Hexo的NexT主题有效的，为了适用于你自己的网页，也需要自行修改，或增加新内容。

## 鸣谢
代码自这篇博文魔改而来：  
https://www.fghrsh.net/post/123.html  
其中增加了一些功能，优化了提示展现机制

更多内容可以参考：  
https://imjad.cn/archives/lab/add-dynamic-poster-girl-with-live2d-to-your-blog-02  
https://zhangshuqiao.org/2018-07/在网页中添加Live2D看板娘

可以自行在后端api中增加模型（需要自行修改）：  
https://github.com/xiazeyu/live2d-widget-models  
https://github.com/xiaoski/live2d_models_collection

## 更新
2018年10月31日，由fghrsh提供的原API停用，请更新至新地址。参考文章：  
https://www.fghrsh.net/post/170.html
