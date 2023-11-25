---
thumbnail: /images/video/basic/video-boy.jpeg
title: Web 视频基础理论
summary: 视频（英语：video, videogram）是泛指将一系列的静态影像以电信号方式加以捕捉、纪录、处理、存储、发送与重现的各种技术。
author: Kisstar
location: 北京
date: 2022-03-17
categoryKeys:
  - av
tagKeys:
  - video
outline: deep
---

<img style="width: 100%; height: 350px;" src="/images/video/basic/video-boy.jpeg" alt="Video Boy">

视频（英语：video, videogram）是泛指将一系列的静态影像以电信号方式加以捕捉、纪录、处理、存储、发送与重现的各种技术。

视频技术最早是为了电视系统而发展，但现在已经发展为各种不同的格式以利消费者将视频记录下来。网络技术的发达也促使视频的纪录片段以串流媒体的形式存在于因特网之上并可被电脑接收与播放。

## 视频的本质

我们常说的视频其实就是一张张图像。根据视觉暂留原理，当连续的图像变化超过每秒 24 张时，人眼无法辨别单幅的静态画面，看上去是平滑连续的视觉效果。

![Image Queue](/images/video/basic/image-queue.png)

图像则是由一个个像素点组成的，一个分辨率为 m×n 的图像，说明水平方向有 m 个像素点，垂直方向有 n 个像素点。

![Resolution Ratio](/images/video/basic/resolution-ratio.png)

每个像素点又由三个子像素点组成，当要显示图像时，就会把这幅图像的每一个像素点的 RGB 通道分别对应屏幕上的子像素点绘制到屏幕上，从而显示整个图像。

::: tip
对于视频帧的裸数据表示，其实更多的是 YUV 数据格式。
:::

## 视频存储

视频的存储需要将视频转化为数字的表示形式，既然视频根本是由像素点组成的，那么想要存储一个视频只需要用数字把相应的像素点记录下来就可以了。

以采用 RGB 颜色模型为例，它将红（Red）、绿（Green）、蓝（Blue）三原色的色光以不同的比例相加，以合成产生各种色彩光。那么，只需要表示出各个颜色的比例就能重现颜色。

![RGB](/images/video/basic/rgb.jpeg)

数值表示可以使用以下几种不同的方式（以红色为例）：

| 方式        | RGB 表示                 |
| :---------- | :----------------------- |
| 浮点        | (1.0, 0.0, 0.0)          |
| 百分比      | (100%, 0%, 0%)           |
| 8 比特模式  | (255, 0, 0) or sometimes |
| 12 比特模式 | (4095, 0, 0)             |
| 16 比特模式 | (65535, 0, 0)            |
| 24 比特模式 | (16777215, 0, 0)         |
| 32 比特模式 | (4294967295, 0, 0)       |

当前主流的标准表示方法为 24 比特模式，它使用三个 8 位无符号整数（0 到 255）表示红色、绿色和蓝色的强度。

## 视频压缩

存储原始视频通常会占用巨大的空间，例如对一个时长 2 小时、分辨率为 1920x1080P 的视频采用 24 比特模式进行存储的话需要占用：

$$24*1920*1080*24*60*60*2/8/1024/1024/1024/1024\approx0.98T$$

可见直接采用这种存储方式是不可行的，更不可能在网络上进行流媒体的流畅播放，所以我们需要通过去除冗余信息来对视频进行编码（压缩）。

视频编码的推进主要得力于 ITU-T 和 ISO/IEC 两大组织，前者制定的视频编码标准为 H.26x 系列，主要用于基于网络传输的视频通信，后者制定了 MPEG 系列，主要用于视频存储、广播电视、网络流媒体等。

后续了为了实现标准的一致性，由 ITU-T 和 MPEG 联合制作了 H.262/MPEG-2、H.264/MPEG-4 AVC、H.265/HEVC 等标准。目前 H.264 标准已经在各个领域得到了广泛的应用。

![Codec](/images/video/basic/codec.png)

由于专利的原因，拥有更高性能的编码标准 H.265 并没有得到普及，为了应对高额的专利费用，开放媒体联盟（Alliance forOpenMedia）开始推行一个开放、免专利的视频编码格式 AOMedia Video 1（简称 AV1）。

## 封装格式

除了图像之外，视频文件通常还包括音频和字幕等内容，所以需要通过容器将它们封装到一起，而不同的封装方式也就对应了我们常说的多种视频文件格式。

容器不同于编解码器，具有相同容器的文件可以使用不同的编解码器来编码其内容，下图说明了这种结构：

![Mux](/images/video/basic/mux.png)

播放视频时则需要进行反向的解封转、解码操作，最后再将资源交由媒体播放器处理。

::: tip
事实上，在 HTML5 视频标准被支持以前，Flash 在 Web 视频播放方面有着统治地位，对应的 FLV 流媒体格式也被广泛应用。
:::

## H5 播放

在 HTML5 标准中提供了 `<video>` 元素用于在 HTML 或者 XHTML 文档中嵌入媒体播放器，用于支持文档内的视频播放。

使用上，我们可以单独使用 `<video>` 元素，然后指定 `type` 属性，以便浏览器将判断是否可以播放提供的视频文件。如果不能，则显示标签中的文本：

```html
<video src="example.webm" type="video/webm">
  <p>Your browser cannot play the provided video file.</p>
</video>
```

并非所有浏览器都支持最新的容器和编解码器，所以我们需要使用几个不同格式的文件来适配不同的浏览器：

```html
<video controls>
  <source src="/example.webm" type="video/webm" />
  <source src="/example.mp4" type="video/mp4" />
  <p>Your browser cannot play the provided video file.</p>
</video>
```

这里尽管 `type` 属性对 `<source>` 标签来说是可选的，但为了确保浏览器仅下载能够播放的文件，应该始终将其添加到标签上。

实际上，虽然现在大多数网站依然使用 `<video>` 标签播放视频，但它们并是直接在 `src` 属性上指定视频源的真实地址，而是使用功能更加强大的 MSE（Media Source Extensions）来实现媒体播放。

## MSE

媒体源扩展 API（MSE） 提供了无插件且基于 Web 的流媒体功能。使用 MSE，媒体串流能够通过 JavaScript 创建，并且能通过使用 `<audio>` 和 `<video>` 元素进行播放。

MSE 使我们可以把通常的单个媒体文件的 `src` 值替换成引用 MediaSource 对象，以及引用多个 SourceBuffer 对象（代表多个组成整个串流的不同媒体块）的元素。

```js
var video = document.querySelector('video');
var mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
var mediaSource = new MediaSource();

video.src = URL.createObjectURL(mediaSource);
mediaSource.addEventListener('sourceopen', sourceOpen);

function sourceOpen() {
  var mediaSource = this;
  var sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);

  sourceBuffer.addEventListener('updateend', function() {
    mediaSource.endOfStream();
    video.play();
  });
  sourceBuffer.appendBuffer(bufferData /* 获取的 ArrayBuffer 格式的视频数据 */);
}
```

借助 MSE 我们可以根据内容获取的大小和频率，或是内存占用详情（例如什么时候缓存被回收），进行更加精准地控制。 它是基于它可扩展的 API 建立自适应比特率流客户端（例如 HLS/DASH 的客户端）的基础。

## HLS/DASH

虽然 MP4 文件在各个浏览器中支持较好，但是由于其头文件较大，初始播放需要下载完整的头文件进行解析，之后再下载一定长度的可播视频片段才能进行播放，这导致初始播放的时间较长。

HLS 的工作原理就是把整个流分成一个个小的基于 HTTP 的文件来下载，每次只下载一些。当媒体流正在播放时，客户端可以选择从许多不同的备用源中以不同的速率下载同样的资源，允许流媒体会话适应不同的数据速率。

在开始一个流媒体会话时，客户端会下载一个包含元数据的扩展 M3U (m3u8) 播放列表文件，用于寻找可用的媒体流。然后根据播放列表中的资源地址陆续下载一个个分片资源。

![HLS](/images/video/basic/hls.png)

HLS 作为苹果推出的流媒体协议，在 IOS 平台上可以获得天然的支持。对于不支持 HLS 的设备也可以使用 HLS.js 库基于 MSE 在浏览器中实现 HLS 播放。

DASH 是类似于 HLS 的另一种建立在 MSE 的基础之上自适应串流协议，在 DASH 协议中使用 MPD 文件保存有关各种流的信息，它告诉浏览器各种媒体的位置，包括元数据，如 mimeType 和编解码器，以及其他细节。

整个播放的大体流程也和 HLS 类似，在下载 MPD 文件后，根据解析得到的信息下载后续的音频和视频分片。相比 HLS 而言，DASH 具有最好的跨平台兼容性。

## 总结

随着 5G、AR/VR 等技术的发展音视频技术也会随之发展，以带给用户更加友好和沉浸式的体验，同时也会催生更多行业和场景来应用音视频技术。

本篇主要是围绕视频相关的基础概念以及在 Web 端的播放方式进行了基础的总结，希望能给刚接触 Web 视频的同学带来帮助，欢迎大家一起指正交流。

## 参考

- [视频 - 维基百科，自由的百科全书](https://zh.wikipedia.org/wiki/%E8%A7%86%E9%A2%91)
- [&lt;video&gt; - HTML（超文本标记语言） | MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/video)
- [HLS.js - GitHub](https://github.com/video-dev/hls.js)
- [Setting up adaptive streaming media sources - Developer guides | MDN](https://developer.mozilla.org/en-US/docs/Web/Guide/Audio_and_video_delivery/Setting_up_adaptive_streaming_media_sources)
