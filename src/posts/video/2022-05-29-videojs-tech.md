---
thumbnail: /images/video/videojs/videojs-logger.png
title: Video.js Tech
summary: 在 Video.js 中，播放技术是指用于播放视频或音频的特定浏览器或插件技术。
author: Kisstar
location: 北京
date: 2022-05-29
categoryKeys:
  - av
tagKeys:
  - video
  - videojs
outline: deep
---

<img style="width: 100%; height: 350px;" src="/images/video/videojs/videojs-tech.png" alt="Videojs Tech">

Video.js 本身是一个提供了 UI 等交互能力的简易播放器，它支持基本的视频和音频播放能力，并确保它们在不同的播放技术中工作一致。

播放技术是指用于播放视频或音频的特定浏览器或插件技术，该技术包括一个 API 包装器，用于在 Video.js 控件和 API 之间转换，以使用特定播放技术的能力。

使用 HTML5 时，播放技术是 `video` 或 `audio` 元素。使用 `videojs-youtube` 技术时，播放技术是 YouTube 播放器。

## Adding Playback Technology

当添加新的播放技术后，它们会自动添加到 techOrder 中。您可以通过修改配置项 techOrder 来更改每个技术的优先级。

通常修改的方式包括两种，一是通过标签配置：

```html
<video data-setup='{"techOrder": ["html5", "other supported tech"]}'></video>
```

另一种则是通过脚本进行配置：

```js
videojs('videoID', {
  techOrder: ['html5', 'other supported tech'],
});
```

## Building an API Wrapper

如果想要创建一个新的播放技术，可以参考 Video.js 的源代码，理解 HTML5 API 包装器是如何创建的。

总的来说，它包括一些方法和事件，其中一部分是必须的。

### Required Methods

```js
class MyTech extends videojs.getComponent('Tech') {
  /**
   * Called by {@link Player#play} to play using the `MyTech` `Tech`.
   */
  play() {}

  /**
   * Called by {@link Player#pause} to pause using the `MyTech` `Tech`.
   */
  pause() {}

  /**
   * Get the current playback time in seconds
   *
   * @return {number}
   *         The current time of playback in seconds.
   */
  currentTime() {
    // when seeking make the reported time keep up with the requested time
    // by reading the time we're seeking to
  }

  /**
   * Get the value of `volume` from the media element. `volume` indicates
   * the current playback volume of audio for a media. `volume` will be a value from 0
   * (silent) to 1 (loudest and default).
   *
   * @return {number}
   *         The value of `volume` from the media element. Value will be between 0-1.
   *
   */
  volume() {}

  /**
   * Get the total duration of the current media.
   *
   * @return {number}
   8          The total duration of the current media.
   */
  duration() {}

  /**
   * Get and create a `TimeRange` object for buffering.
   *
   * @return {TimeRange}
   *         The time range object that was created.
   */
  buffered() {}

  /**
   * Check if fullscreen is supported on the current playback device.
   *
   * @return {boolean}
   *         - True if fullscreen is supported.
   *         - False if fullscreen is not supported.
   */
  supportsFullScreen() {}
}

/**
 * Check if the tech can support the given type
 *
 * @param {string} type
 *        The mimetype to check
 * @return {string} 'probably', 'maybe', or '' (empty string)
 */
MyTech.canPlayType = function canPlayType(type) {};
```

### Required Events

| name           | desc                                                |
| :------------- | :-------------------------------------------------- |
| loadstart      | 开始加载资源。                                      |
| play           | 当 paused 属性由 true 转换为 false 时触发 play 事件 |
| pause          | 当 paused 属性由 false 转换为 true 时触发 play 事件 |
| playing        | 播放事件在首次开始播放后以及每次重新启动时触发。    |
| ended          | 在播放结束时触发                                    |
| volumechange   | 在音量发生改变时触发                                |
| durationchange | 在时长属性更新时被触发                              |
| error          | 播放器出错时触发。                                  |

### Optional Events (include if supported)

| name            | desc                                |
| :-------------- | :---------------------------------- |
| timeupdate      | 当 currentTime 属性发生改变时触发。 |
| enterFullScreen |                                     |
| exitFullScreen  |                                     |
| progress        | 在浏览器加载资源时周期性地触发。    |

## Posters

默认情况下，Tech 必须处理自己的 Poster，并且在一定程度上被排除在播放器的 Poster 生命周期之外。

然而，当播放器使用 techCanOverridePoster 选项初始化时，Tech 将有可能集成到该生命周期中，并使用播放器的后期图像组件。

Tech 可以通过检查选项中的 canOverridePoster 布尔值来检查他们是否具有此功能。

对于 techCanOverridePoster 的要求：

- `poster()` 返回 Tech 当前的 Poster URL；
- `setPoster()` 更新 Tech 的 Poster 的 URL，并触发播放器将处理的 `posterchange` 事件。

## Technology Ordering

当给 Video.js 提供一系列资源地址时，要使用哪个资源取决于找到第一个支持的资源/技术组合。将按照 techOrder 中指定的顺序查询每个 tech 是否可以播放第一个源。

如果没 Tech 可以播放第一个源，那么将测试下一个源。正确设置每个源的类型对于该测试的准确性非常重要。

例如，给定以下视频元素，假设 `videojs-flash` 技术和 `videojs-contrib-hls` 源处理程序可用：

```html
<!-- "techOrder": ["html5", "flash"] -->
<video
  <source src="http://your.static.provider.net/path/to/video.m3u8" type="application/x-mpegURL" />
  <source src="http://your.static.provider.net/path/to/video.mp4" type="video/mp4" />
</video>
```

- Safari 可以在标准 HTML5 视频元素中播放 HLS，因此 HLS 将使用 HTML5 技术播放；
- Chrome 无法单独在标准 HTML5 视频元素中播放 HLS，但 `videojs-contrib-hls` 源处理程序可以通过 HTML5 中的媒体源扩展播放 HLS。因此 HLS 将在 HTML5 技术中发挥作用;
- IE 10 无法在本地播放 HLS，并且不支持媒体源扩展。由于源代码无法在 HTML5 中播放，因此可以测试 Flash 技术。`videojs-contrib-hls` 源处理程序可以在 Flash tech 中播放 HLS，因此 HLS 将在 Flash tech 中播放。

现在，使用 `videojs-contrib-hls`，但不使用 `videojs-flash`，再次获取相同的来源：

```html
<!-- "techOrder": ["html5"] -->
<video
  <source src="http://your.static.provider.net/path/to/video.m3u8" type="application/x-mpegURL" />
  <source src="http://your.static.provider.net/path/to/video.mp4" type="video/mp4" />
</video>
```

- Safari 将在 HTML5 技术中播放 HLS；
- Chrome 将通过 `videojs-contrib-hls` 在 HTML5 技术中播放 HLS；
- IE 10 不能在 HTML5 或 Flash 技术中播放 HLS。接下来将测试 MP4 源代码。MP4 可以由 HTML5 播放，因此将使用 HTML5 技术播放 MP4；

依旧是统一的源，这一次我们有 `videojs-flash`，但没有 `videojs-contrib-hls`：

```html
<!-- "techOrder": ["html5", "flash"] -->
<video
  <source src="http://your.static.provider.net/path/to/video.m3u8" type="application/x-mpegURL" />
  <source src="http://your.static.provider.net/path/to/video.mp4" type="video/mp4" />
</video>
```

- Safari 将在 HTML5 技术中播放 HLS；
- Chrome 无法在 HTML5 或 Flash 技术中播放 HLS，因此将在 HTML5 技术中播放 MP4；
- IE 10 也不能在 HTML5 或 Flash 技术中播放 HLS，也将在 HTML5 技术中播放 MP4。

## 参考

- [Tutorial: tech | Video.js Documentation](https://docs.videojs.com/tutorial-tech_.html)
