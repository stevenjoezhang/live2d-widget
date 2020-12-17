# Live2D Widget - I18n

This is a fork from stevenjoezhang/live2d-widget waifu-js tips that support i18n.

Original Documentation: https://github.com/stevenjoezhang/live2d-widget

For a full documentation, please check the above link.

**NOTE**: I tried my best to translate it to English. Some of them are still from Google Translate. Contribution for translations are welcome in all languages.

## Demo:
[http://nonsoft.ml/live2d-widget-i18n/demo/demo.html](http://nonsoft.ml/live2d-widget-i18n/demo/demo.html)

## Dependencies:

**Fontawesome (same as original project):**
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4/dist/css/bootstrap.min.css">
```

**i18n-js: https://github.com/fnando/i18n-js**
```html
<!-- Must include this BEFORE autoload.js. Ideally in <head> -->
<script src="https://cdn.jsdelivr.net/npm/i18n-js@3.8.0/app/assets/javascripts/i18n.min.js"></script>
```

## Setup

### 1. Add dependencies

Add i18n-js cdn as instructed above.

### 2. Modify autoload.js

From our default `autoload.js`, put this script in the bottom:

```js
I18n.defaultLocale = "en-US";
I18n.locale = "en-US";

I18n.translations = {};

fetch("../i18n.json").then(res => res.json()).then(data => {
    Object.keys(data).forEach(key => {
        console.log("key", key)
        I18n.translations[key] = data[key];
    })
});
```
For a list of complete locale, click [here](https://github.com/ladjs/i18n-locales).

### 3. Replace `waifu-tips.json`
Replace `waifu-tips.json` the same as [waifu-tips.json in this repo](/waifu-tips.json).
This will load up i18n syntax. Modify this file as you needed.

### 4. Replace `waifu-tips.js` 

Replace `waifu-tips.js` the same as [waifu-tips.js in this repo](/waifu-tips.js).
This will modify the script to work with i18n.

### 5. Download and modify i18n.json
`i18n.json` will be the files contain our main conversations. Add more languages and modify as you wished.


## Contribution
Contribution are very welcome. You send a pull request.
