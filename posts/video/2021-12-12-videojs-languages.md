---
thumbnail: /images/video/videojs/videojs-languages.png
title: Video.js 国际化
summary: Video.js 提供了对国际化的支持，会使用一个 JSON 对象来描述一种语言，可以在适当的情况下以英语以外的语言显示文案。
author: Kisstar
location: 北京
date: 2021-12-12
tags:
  - Video
  - Video.js
---

<img :src="$withBase('/images/video/videojs/videojs-languages.png')" alt="videojs-languages">

Video.js 提供了对国际化的支持，可以在适当的情况下以英语以外的语言显示文案。

有关 Video.js 支持的语言的最新列表，请参阅 [lang][lang] 文件夹。有些翻译可能不如其他翻译完整-请参阅 [translations needed doc][translations_doc]，以获取可用翻译中缺少的字符串表。

## 语言包

在 Video.js 中，会使用一个 JSON 对象来描述一种语言，其中键是英语，值是目标语言。例如，简体中文翻译可能如下所示：

```json
{
  "Play": "播放",
  "Pause": "暂停",
  "Current Time": "当前时间",
  "Duration": "时长",
  "Remaining Time": "剩余时间"
}
```

对应的每个文件的名称都是[标准语言代码][standard_language_code]，如简体中文为“zh-CN.json”。你可以按照以上步骤对现有语言进行更新：

- 编辑相关的 JSON 文件并进行必要的更改。
- 通过运行特定于语言的 `npm run build:lang` 来验证语言编译，或者使用 `npm run build` 完整构建。
- 验证翻译是否正确显示在播放器 UI 中。
- 运行 `npm run docs:lang` 更新丢失的翻译文档。
- 在 GitHub 上提交 Pull 请求。

编写新语言文件的过程实际上与更新现有翻译的过程相同，只是需要创建新的翻译 JSON 文件。

## 添加语言

语言文件打包后会被编译到 `dist/lang/` 下，并用 `videojs.addLanguage()` 方法进行了包装：

```js
videojs.addLanguage('zh-CN', {
  Play: '播放',
  Pause: '暂停',
  'Current Time': '当前时间',
  Duration: '时长',
  'Remaining Time': '剩余时间',
});
```

借此每个文件都可以包含在网页中，以便在所有 Video.js 播放器中支持该语言：

```js
<script src="//example.com/path/to/video.min.js"></script>
<script src="//example.com/path/to/lang/es.js"></script>
```

如果对象包含以前翻译过的字符串，`addLanguage()` 将覆盖现有的翻译。但是，已本地化的文本在生成后将不会更新。

除了为 Video.js 本身提供语言外，还可以通过语言选项为各个播放器实例提供自定义语言支持：

```js
// Provide a custom definition of Spanish to this player.
videojs('my-player', {
  languages: {
    es: {
      Play: 'Reproducir',
    },
  },
});
```

## 使用语言

播放器实例使用的语言可以通过语言选项设置：

```js
// Set the language to Spanish for this player.
videojs('my-player', {
  language: 'es',
});
```

播放器的 `language()` 方法可以通过 `language('es')` 的方式来设置实例化后的语言。但是这通常没有用处，因为它不会更新已经存在的文本。

默认情况下，Video.js 会按照下面的优先级进行自动选择：

(1) 选项中指定的语言。
(2) 由播放器元素的 `lang` 属性指定的语言。
(3) 由具有 `lang` 属性的最近父元素指定的语言，最多包括 `<html>` 元素。
(4) 浏览器语言偏好，如果配置了多种语言，则为第一种语言。
(5) 英语。

语言代码不区分大小写（e.g. en-US == en-us）。另外，如果语言代码与子代码（例如 en-us）不匹配，则使用与主代码（例如 en）匹配的代码（如果可用）。

## 语言系统

接下来我们从语言添加、配置获取和语言设置等几个方面来了解下 Video.js 中的语言系统是如何构建起来的。

### 语言添加

正如上面所介绍到的，Video.js 默认情况下仅支持英语，如果想要支持其它语言需要使用 `addLanguage()` 方法进行添加：

```js
videojs.addLanguage = function(code, data) {
  code = ('' + code).toLowerCase();

  videojs.options.languages = mergeOptions(videojs.options.languages, {
    [code]: data,
  });

  return videojs.options.languages[code];
};
```

内部会以语言名称为键写入到 `options` 属性的 `languages` 字段上，该值默认是一个空对象：

```js
videojs.options = Player.prototype.options_;

Player.prototype.options_ = {
  languages: {},
  // ...
};
```

最后，在播放器的构造函数中调用完设置语言的函数之后，还会根据配置项中的 `languages` 字段对支持的语言列表进行更新：

```js
class Player extends Component {
  constructor(tag, options, ready) {
    // ...
    // Update Supported Languages
    if (options.languages) {
      // Normalise player option languages to lowercase
      const languagesToLower = {};

      Object.getOwnPropertyNames(options.languages).forEach(function(name) {
        languagesToLower[name.toLowerCase()] = options.languages[name];
      });
      this.languages_ = languagesToLower;
    } else {
      this.languages_ = Player.prototype.options_.languages;
    }
  }
}
```

那么，为什么会在设置完整之后采取更新支持的语言呢？这样的话，指定的语言列表生效吗？

### 配置获取

在播放器初始化的过程中会从标签上获取配置，并将其与用户传递的配置进行合并：

```js
class Player extends Component {
  constructor(tag, options, ready) {
    // ...
    options = assign(Player.getTagSettings(tag), options); // 获取标签上的配置项
    // ...
  }
}
```

之后，判断当前配置项中是否包含对语言的设置，如果没有的话就会开始读取最近父元素是否有 `lang` 属性：

```js
class Player extends Component {
  constructor(tag, options, ready) {
    // ...
    if (!options.language) {
      if (typeof tag.closest === 'function') {
        const closest = tag.closest('[lang]');

        if (closest && closest.getAttribute) {
          options.language = closest.getAttribute('lang');
        }
      } else {
        let element = tag;

        while (element && element.nodeType === 1) {
          if (Dom.getAttributes(element).hasOwnProperty('lang')) {
            options.language = element.getAttribute('lang');
            break;
          }
          element = element.parentNode;
        }
      }
    }
    // ...
  }
}
```

另外，Player 继承了 Component 组件，在 Component 组件的构造函数中还将用户的配置和原型上的默认配置进行了合并：

```js
this.options_ = mergeOptions({}, this.options_);
options = this.options_ = mergeOptions(this.options_, options);
```

对于 Player 来说，初始的 `this.options_` 指向的也就是上面提到的 `Player.prototype.options_`，这也将上面添加的语言联系了起来。

在 `Player.prototype.options_` 中也提供了默认的语言：

```js
Player.prototype.options_ = {
  // ...
  language:
    (navigator &&
      ((navigator.languages && navigator.languages[0]) ||
        navigator.userLanguage ||
        navigator.language)) ||
    'en',
};
```

### 语言设置

在播放器上提供了 `language()` 方法来进行语言切换，它会在播放器获取完配置后自动执行一次：

```js
class Player extends Component {
  language(code) {
    if (code === undefined) {
      return this.language_;
    }

    if (this.language_ !== String(code).toLowerCase()) {
      this.language_ = String(code).toLowerCase();

      // 如果混合了事情系统就触发语言变更的事件
      if (isEvented(this)) {
        this.trigger('languagechange');
      }
    }
  }
}
```

目前，在 Component 组件上提供的 `handleLanguagechange()` 方法什么也没做：

```js
class Component {
  handleLanguagechange() {}
}
```

该方法应该由子组件进行重写，比如在 ClickableComponent 组件中它会重新设置空间元素的文案：

```js
class ClickableComponent extends Component {
  handleLanguagechange() {
    this.controlText(this.controlText_);
  }

  controlText(text, el = this.el()) {
    if (text === undefined) {
      return this.controlText_ || 'Need Text';
    }

    const localizedText = this.localize(text);

    this.controlText_ = text;
    Dom.textContent(this.controlTextEl_, localizedText); // 重新设置空间元素的文案
    if (!this.nonIconControl && !this.player_.options_.noUITitleAttributes) {
      // Set title attribute if only an icon is shown
      el.setAttribute('title', localizedText);
    }
  }
}
```

这里需要注意的一个方法是 `localize()`，它也是整个国际化功能的关键。内部会根据当前语言以及对应的 JSON 配置返回正确的文案：

```js
class Component {
  /**
   * @param {string} string 要国际化的字符串和在语言文件中查找的键
   * @param {string[]} [tokens] 如果当前项有 token 替换，请在此处提供 token
   * @param {string} [defaultValue] 默认值
   */
  localize(string, tokens, defaultValue = string) {
    const code = this.player_.language && this.player_.language(); // 获取当前的语言
    const languages = this.player_.languages && this.player_.languages();
    const language = languages && languages[code]; // 获取当前语言的 JSON 配置
    const primaryCode = code && code.split('-')[0]; // 主代码
    const primaryLang = languages && languages[primaryCode];

    let localizedString = defaultValue;

    // 如果语言子代码没有匹配到，就尝试使用主代码的
    if (language && language[string]) {
      localizedString = language[string];
    } else if (primaryLang && primaryLang[string]) {
      localizedString = primaryLang[string];
    }

    // 在指定的文案中可以包含 {1} 这样的 token，它将使用第二个参数中指定的值进行替换
    if (tokens) {
      localizedString = localizedString.replace(/\{(\d+)\}/g, function(
        match,
        index
      ) {
        const value = tokens[index - 1];
        let ret = value;

        if (typeof value === 'undefined') {
          ret = match;
        }

        return ret;
      });
    }

    return localizedString;
  }
}
```

所以，在播放器中对于想要支持国际化的文案都需要通过 `localize()` 方法进行处理。

## 参考

- [Tutorial: languages | Video.js Documentation](https://docs.videojs.com/tutorial-languages.html)

[lang]: https://github.com/videojs/video.js/tree/main/lang
[translations_doc]: https://github.com/videojs/video.js/blob/main/docs/translations-needed.md
[standard_language_code]: https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
