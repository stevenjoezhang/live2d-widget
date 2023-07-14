# Live2D Widget

![](https://forthebadge.com/images/badges/built-with-love.svg)
![](https://forthebadge.com/images/badges/uses-html.svg)
![](https://forthebadge.com/images/badges/made-with-javascript.svg)
![](https://forthebadge.com/images/badges/contains-cat-gifs.svg)
![](https://forthebadge.com/images/badges/powered-by-electricity.svg)
![](https://forthebadge.com/images/badges/makes-people-smile.svg)

[English](README.en.md)

## 特性

在網頁中添加 Live2D 看板娘。兼容 PJAX，支持無刷新加載。

<img src="assets/screenshot-2.png" width="280"><img src="assets/screenshot-3.png" width="280"><img src="assets/screenshot-1.png" width="270">

（注：以上人物模型僅供展示之用，本倉庫並不包含任何模型。）

你也可以查看示例網頁：

- 在 [米米的博客](https://zhangshuqiao.org) 的左下角可查看效果
- [demo.html](https://mi.js.org/live2d-widget/demo/demo.html)，展現基礎功能
- [login.html](https://mi.js.org/live2d-widget/demo/login.html)，仿 NPM 的登陸界面

## 使用

如果你是小白，或者只需要最基礎的功能，那麼只用將這一行代碼加入 html 頁面的 `head` 或 `body` 中，即可加載看板娘：
```xml
<script src="https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/autoload.js"></script>
```
添加代碼的位置取決於你的網站的構建方式。例如，如果你使用的是 [Hexo](https://hexo.io)，那麼需要在主題的模版文件中添加以上代碼。對於用各種模版引擎生成的頁面，修改方法類似。
如果網站啟用了 PJAX，由於看板娘不必每頁刷新，需要注意將該腳本放到 PJAX 刷新區域之外。

**但是！我們強烈推薦自己進行配置，讓看板娘更加適合你的網站！ **  
如果你有興趣自己折騰的話，請看下面的詳細說明。

## 配置

你可以對照 `autoload.js` 的源碼查看可選的配置項目。 `autoload.js` 會自動加載三個文件：`waifu.css`，`live2d.min.js` 和 `waifu-tips.js`。 `waifu-tips.js` 會創建 `initWidget` 函數，這就是加載看板娘的主函數。 `initWidget` 函數接收一個 Object 類型的參數，作為看板娘的配置。以下是配置選項：

| 選項 | 類型 | 默認值 | 說明 |
| - | - | - | - |
| `waifuPath` | `string` | `https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/waifu-tips.json` | 看板娘資源路徑，可自行修改 |
| `apiPath` | `string` | `https://live2d.fghrsh.net/api/` | API 路徑，可選參數 |
| `cdnPath` | `string` | `https://fastly.jsdelivr.net/gh/fghrsh/live2d_api/` | CDN 路徑，可選參數 |
| `tools` | `string[]` | 見 `autoload.js` | 加載的小工具按鈕，可選參數 |

其中，`apiPath` 和 `cdnPath` 兩個參數設置其中一項即可。 `apiPath` 是後端 API 的 URL，可以自行搭建，並增加模型（需要修改的內容比較多，此處不再贅述），可以參考 [live2d_api](https://github.com/fghrsh/live2d_api)。而 `cdnPath` 則是通過 jsDelivr 這樣的 CDN 服務加載資源，更加穩定。

## 自定義

如果以上「配置」部分提供的選項還不足以滿足你的需求，那麼你可以自己進行修改。本倉庫的目錄結構如下：

- `src/waifu-tips.js` 包含了按鈕和對話框的邏輯；
- `waifu-tips.js` 是由 `src/waifu-tips.js` 自動打包生成的，不建議直接修改；
- `waifu-tips.json` 中定義了觸發條件（`selector`，CSS 選擇器）和触發時顯示的文字（`text`）；
- `waifu.css` 是看板娘的樣式表。

`waifu-tips.json` 中默認的 CSS 選擇器規則是對 Hexo 的 [NexT 主題](http://github.com/next-theme/hexo-theme-next) 有效的，為了適用於你自己的網頁，可能需要自行修改，或增加新內容。
**警告：`waifu-tips.json` 中的內容可能不適合所有年齡段，或不宜在工作期間訪問。在使用時，請自行確保它們是合適的。 **

要在本地部署本項目的開發測試環境，你需要安裝 Node.js 和 npm，然後執行以下命令：

```bash
git clone https://github.com/stevenjoezhang/live2d-widget.git
npm install
npm run build
```

如果有任何疑問，歡迎提 Issue。如果有任何修改建議，歡迎提 Pull Request。

## 部署

在本地完成了修改後，你可以將修改後的項目部署在服務器上，或者通過 CDN 加載，以便在網頁中使用。

### 使用 CDN

要自定義有關內容，可以把這個倉庫 Fork 一份，然後把修改後的內容通過 git push 到你的倉庫中。這時，使用方法對應地變為
```xml
<script src="https://fastly.jsdelivr.net/gh/username/live2d-widget@latest/autoload.js"></script>
```
將此處的 `username` 替換為你的 GitHub 用戶名。為了使 CDN 的內容正常刷新，需要創建新的 git tag 並推送至 GitHub 倉庫中，否則此處的 `@latest` 仍然指向更新前的文件。此外 CDN 本身存在緩存，因此改動可能需要一定的時間生效。相關文檔：
- [Git Basics - Tagging](https://git-scm.com/book/en/v2/Git-Basics-Tagging)
- [Managing releases in a repository](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)

### Self-host

你也可以直接把這些文件放到服務器上，而不是通過 CDN 加載。

- 如果你能夠通過 `ssh` 連接你的主機，請把 Fork 並修改後的代碼倉庫克隆到服務器上。
- 如果你的主機無法用 `ssh` 連接（例如一般的虛擬主機），請在本地修改好代碼後，通過 `ftp` 等方式將文件上傳到主機的網站的目錄下。
- 如果你是通過 Hexo 等工具部署的靜態博客，請把本項目的代碼放在博客源文件目錄下（例如 `source` 目錄）。重新部署博客時，相關文件就會自動上傳到對應的路徑下。為了避免這些文件被 Hexo 插件錯誤地修改，可能需要設置 `skip_render`。

這樣，整個項目就可以通過你的域名訪問了。不妨試試能否正常地通過瀏覽器打開 `autoload.js` 和 `live2d.min.js` 等文件，並確認這些文件的內容是完整和正確的。
一切正常的話，接下來修改 `autoload.js` 中的常量 `live2d_path` 為 `live2d-widget` 這一目錄的 URL 即可。比如說，如果你能夠通過
```
https://example.com/path/to/live2d-widget/live2d.min.js
```
訪問到 `live2d.min.js`，那麼就把 `live2d_path` 的值修改為
```
https://example.com/path/to/live2d-widget/
```
路徑末尾的 `/` 一定要加上。
完成後，在你要添加看板娘的界面加入
```xml
<script src="https://example.com/path/to/live2d-widget/autoload.js"></script>
```
就可以加載了。

## 鳴謝

<a href="https://www.browserstack.com/">
  <picture>
    <source media="(prefers-color-scheme: dark)" height="80" srcset="https://d98b8t1nnulk5.cloudfront.net/production/images/layout/logo-header.png?1469004780">
    <source media="(prefers-color-scheme: light)" height="80" srcset="https://live.browserstack.com/images/opensource/browserstack-logo.svg">
    <img alt="BrowserStack Logo" height="80" src="https://live.browserstack.com/images/opensource/browserstack-logo.svg">
  </picture>
</a>

> 感謝 BrowserStack 容許我們在真實的瀏覽器中測試此項目。
> Thanks to [BrowserStack](https://www.browserstack.com/) for providing the infrastructure that allows us to test in real browsers!

<a href="https://www.jsdelivr.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" height="80" srcset="https://raw.githubusercontent.com/jsdelivr/jsdelivr-media/master/white/svg/jsdelivr-logo-horizontal.svg">
    <source media="(prefers-color-scheme: light)" height="80" srcset="https://raw.githubusercontent.com/jsdelivr/jsdelivr-media/master/default/svg/jsdelivr-logo-horizontal.svg">
    <img alt="jsDelivr Logo" height="80" src="https://raw.githubusercontent.com/jsdelivr/jsdelivr-media/master/default/svg/jsdelivr-logo-horizontal.svg">
  </picture>
</a>

> 感謝 jsDelivr 提供的 CDN 服務。
> Thanks jsDelivr for providing public CDN service.

代碼自這篇博文魔改而來：  
https://www.fghrsh.net/post/123.html

感謝 [一言](https://hitokoto.cn) 提供的語句接口。

點擊看板娘的紙飛機按鈕時，會出現一個彩蛋，這來自於 [WebsiteAsteroids](http://www.websiteasteroids.com)。

## 更多

更多內容可以參考：  
https://nocilol.me/archives/lab/add-dynamic-poster-girl-with-live2d-to-your-blog-02  
https://github.com/xiazeyu/live2d-widget.js  
https://github.com/summerscar/live2dDemo

關於後端 API 模型：  
https://github.com/xiazeyu/live2d-widget-models  
https://github.com/xiaoski/live2d_models_collection

除此之外，還有桌面版本：  
https://github.com/amorist/platelet  
https://github.com/akiroz/Live2D-Widget  
https://github.com/zenghongtu/PPet  
https://github.com/LikeNeko/L2dPetForMac

以及 Wallpaper Engine：  
https://github.com/guansss/nep-live2d

## 許可證

Released under the GNU General Public License v3  
http://www.gnu.org/licenses/gpl-3.0.html

本倉庫並不包含任何模型，用作展示的所有 Live2D 模型、圖片、動作數據等版權均屬於其原作者，僅供研究學習，不得用於商業用途。

Live2D 官方網站：  
https://www.live2d.com/en/  
https://live2d.github.io

Live2D Cubism Core は Live2D Proprietary Software License で提供しています。
https://www.live2d.com/eula/live2d-proprietary-software-license-agreement_en.html  
Live2D Cubism Components は Live2D Open Software License で提供しています。
http://www.live2d.com/eula/live2d-open-software-license-agreement_en.html

> The terms and conditions do prohibit modification, but obfuscating in `live2d.min.js` would not be considered illegal modification.

https://community.live2d.com/discussion/140/webgl-developer-licence-and-javascript-question

## 更新日誌

2018年10月31日，由 fghrsh 提供的原 API 停用，請更新至新地址。參考文章：  
https://www.fghrsh.net/post/170.html

2020年1月1日起，本項目不再依賴於 jQuery。

2022年11月1日起，本項目不再需要用戶單獨加載 Font Awesome。
