# live2d-widget

## 功能
在网页中添加Live2D看板娘

## Demo
在[米米的博客](https://zhangshuqiao.org)的左下角可查看效果

## 依赖
需要jQuery和font-awesome支持，请确保它们已在页面中加载，例如在`<header>`中加入：
```xml
<script src="https://cdn.jsdelivr.net/npm/jquery@3.3.1/dist/jquery.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css">
```
否则无法正常显示。

## 使用
如果你可以通过ssh访问你的主机，请把整个项目克隆到服务器上。执行：
```bash
cd /path/to/your/webroot
git clone https://github.com/stevenjoezhang/live2d-widget.git
```
如果你的主机是虚拟主机，请选择`Download ZIP`，然后通过ftp上传到主机上，再解压到网站的目录下。  
如果你通过Hexo等工具部署静态博客，请选择`Download ZIP`，然后解压到本地的博客目录下。重新部署博客时，相关文件就会自动上传。

这样，整个项目就可以通过你的ip或者域名从公网访问了。你可以试试能否正常的通过浏览器打开`autoload.js`和`live2d.min.js`等文件。  
如果没有问题，接下来需要修改一些配置。（你也可以先在本地完成这一步骤，再上传到服务器上）  
修改autoload.js中的参数`live2d_path`为`live2d-widget`这一文件夹在公网上的路径。比如说，如果你可以通过
```
https://www.example.com/path/to/live2d-widget/live2d.min.js
```
访问到`live2d.min.js`，那么就把`live2d_path`的值修改为
```
https://www.example.com/path/to/live2d-widget/
```
路径末尾的`/`一定要加上。具体可以参考该文件内的注释。  
完成后，在你要添加看板娘的界面加入
```xml
<script src="https://www.example.com/path/to/live2d-widget/autoload.js"></script>
```
就可以加载了。

waifu-tips.json中包含了触发条件（selector，选择器）和触发时显示的文字（text）。源文件是对Hexo的NexT主题有效的，为了适用于你自己的网页，也需要自行修改，或增加新内容。  
如果有任何疑问，欢迎提交ISSUE。

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
