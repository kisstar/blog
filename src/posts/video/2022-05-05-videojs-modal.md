---
thumbnail: /images/video/videojs/videojs-modal.png
title: Video.js 模态框
summary: ModalDialog 组件是 Video.js 核心的一部分，它为完整的播放器覆盖提供了一个 UI。
author: Kisstar
location: 北京
date: 2022-05-05
categoryKeys:
  - av
tagKeys:
  - video
  - videojs
outline: deep
---

<img style="width: 100%; height: 350px;" src="/images/video/videojs/videojs-modal.png" alt="Videojs Modal">

ModalDialog 组件是 Video.js 核心的一部分，它为完整的播放器覆盖提供了一个 UI。

## 创建模态框

除了内置的 Video.js 组件创建方法外，播放器还包含一个 `createModal()` 方法。

接下来，我们通过创建一个案列来演示这两种方法，在该案列中我们在播放器暂停时打开模态框，在模态框关闭时恢复播放。

### createModal

如果你需要创建一个临时打开的一次性模态框，那么 `createModal()` 方法比较合适，它们会在创建时立即打开，默认情况下，在关闭时会立即进行处理。

```js
var player = videojs('my-player');

player.on('pause', function() {
  // Modals are temporary by default. They dispose themselves when they are
  // closed; so, we can create a new one each time the player is paused and
  // not worry about leaving extra nodes hanging around.
  var modal = player.createModal('This is a modal!');

  // When the modal closes, resume playback.
  modal.on('modalclose', function() {
    player.play();
  });
});
```

这里的 `createModal()` 方法还接受第二个参数—一个包含模态选项的对象。

### ModalDialog Constructor

与使用 `createModal()` 方法时不同，默认情况下，使用构造函数创建的模态框不会自动打开。这使得这种方法更适合想要模态框无限期地存在于 DOM 中的场景。

```js
var player = videojs('my-player');
var ModalDialog = videojs.getComponent('ModalDialog');

var modal = new ModalDialog(player, {
  // We don't want this modal to go away when it closes.
  temporary: false,
});

player.addChild(modal);

player.on('pause', function() {
  modal.open();
});

player.on('play', function() {
  modal.close();
});
```

在用户体验方面，上面两个例子是等价的。实现者应该使用更适合它们用例的方法。

### 常用配置项

```js
var options = {
  content: '', // 提供模态框展示的内容
  description: '', // 模态的文本描述，主要用于可访问性
  pauseOnOpen: true, // 模态框显示的时候是否停止播放
  temporary: false, // 为 ture 时表示一个一次性模态框，关闭后就会被销毁
  fillAlways: false, // 通常，模态框只有在第一次打开时才会自动填充。这告诉模态在每次打开时刷新其内容。
  label: '', // Modal 的文本标签，主要用于可访问性
  uncloseable: false, // 如果为 true，用户将无法通过 UI 关闭，程序关闭仍然是可能的。
};
```

## 基础实现

从模态框的创建到展示来看，在 ModalDialog 组件的构造函数中主要做了两件事情：记录配置中传递的内容和创建模态框的整体结构。

```js
class ModalDialog extends Component {
  constructor(player, options) {
    // ...
    this.content(this.options_.content);
  }

  content(value) {
    if (typeof value !== 'undefined') {
      this.content_ = value;
    }
    return this.content_;
  }
}
```

示例中将配置中传递的内容存储到了实例的 `content_` 属性上，接着是创建整体结构的部分：

```js
class ModalDialog extends Component {
  constructor(player, options) {
    // ...
    this.contentEl_ = Dom.createEl(
      'div',
      {
        className: `${MODAL_CLASS_NAME}-content`,
      },
      {
        role: 'document',
      }
    );

    this.descEl_ = Dom.createEl('p', {
      className: `${MODAL_CLASS_NAME}-description vjs-control-text`,
      id: this.el().getAttribute('aria-describedby'),
    });

    Dom.textContent(this.descEl_, this.description());
    this.el_.appendChild(this.descEl_);
    this.el_.appendChild(this.contentEl_);
  }

  createEl() {
    return super.createEl(
      'div',
      {
        className: this.buildCSSClass(),
        tabIndex: -1,
      },
      {
        'aria-describedby': `${this.id()}_description`,
        'aria-hidden': 'true',
        'aria-label': this.label(),
        role: 'dialog',
      }
    );
  }
}
```

此处的 `descEl_` 主要是用作可访问性的，内容是使用的配置项中的 `description` 字段的值。主要的还是 `el_`，其中承载了模态框的所有内容。

我们传递的内容会被放置在 `contentEl_` 中，放置的动作方法在模态框显示的时候（仅保留了核心逻辑）：

```js
class ModalDialog extends Component {
  open() {
    if (!this.opened_) {
      // ...
      const player = this.player();
      this.trigger('beforemodalopen');

      if (
        this.options_.fillAlways ||
        (!this.hasBeenOpened_ && !this.hasBeenFilled_)
      ) {
        this.fill();
      }

      this.show();
      this.trigger('modalopen');
    }
  }

  fill() {
    this.fillWith(this.content());
  }
}
```

其中首先调用了 `fill()` 方法填充模态框的内容，也就是调用了 `fillWith()` 方法。它会先移除当前的 `el_`，在装填好内容之后再插入到 DOM 树中：

```js
class ModalDialog extends Component {
  fillWith(content) {
    const contentEl = this.contentEl();
    const parentEl = contentEl.parentNode;
    const nextSiblingEl = contentEl.nextSibling;

    this.trigger('beforemodalfill');
    this.hasBeenFilled_ = true;

    // 在执行操作之前从 DOM分 离 content 元素，以避免多次修改活动 DOM
    parentEl.removeChild(contentEl);
    this.empty();
    Dom.insertContent(contentEl, content);
    this.trigger('modalfill');

    // Re-inject the re-filled content element.
    if (nextSiblingEl) {
      parentEl.insertBefore(contentEl, nextSiblingEl);
    } else {
      parentEl.appendChild(contentEl);
    }

    // make sure that the close button is last in the dialog DOM
    const closeButton = this.getChild('closeButton');

    if (closeButton) {
      parentEl.appendChild(closeButton.el_);
    }
  }
}
```

最后，就是将装填好的内容显示出来了。显示和隐藏的功能主要是使用了继承自 Component 组件的 `show()` 和 `hide()` 方法：

```js
class Component {
  show() {
    this.removeClass('vjs-hidden');
  }

  hide() {
    this.addClass('vjs-hidden');
  }
}
```

当然，真正显示和隐藏的时候还做了其它一些事情，不过这里的样式切换就是该功能的关键。这里的 `close()` 方法我们也只保留了核心的逻辑：

```js
class ModalDialog extends Component {
  close() {
    const player = this.player();

    this.trigger('beforemodalclose');

    if (this.wasPlaying_ && this.options_.pauseOnOpen) {
      player.play();
    }

    this.hide();
    this.trigger('modalclose');

    if (this.options_.temporary) {
      this.dispose();
    }
  }
}
```

可见它主要是处理了一些事件，然后调用了上面提到的 `hide()` 方法对模态框进行隐藏。

## ErrorDisplay

在播放器中还内置了一个 ErrorDisplay 组件，该组件继承了 ModalDialog，主要负责向用户提示错误信息。

内部的实现主要是监听的播放器的错误时间来进行展示，并通过播放器的 `error()` 方法来获取错误信息：

```js
class ErrorDisplay extends ModalDialog {
  constructor(player, options) {
    super(player, options);
    this.on(player, 'error', (e) => this.open(e));
  }

  buildCSSClass() {
    return `vjs-error-display ${super.buildCSSClass()}`;
  }

  content() {
    const error = this.player().error();

    return error ? this.localize(error.message) : '';
  }
}
```

同时，通过重写 `buildCSSClass()` 方法来自定义样式：

```js
class ErrorDisplay extends ModalDialog {
  buildCSSClass() {
    return `vjs-error-display ${super.buildCSSClass()}`;
  }
}
```

## 参考

- [Tutorial: modal-dialog | Video.js Documentation](https://docs.videojs.com/tutorial-modal-dialog.html)
