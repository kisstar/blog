---
thumbnail: /images/comprehensive/parallax-scrolling.png
title: 视差滚动
summary: 视差滚动（Parallax Scrolling）是指让多层背景以不同的速度移动，形成立体的运动效果。
author: Kisstar
location: 北京
date: 2021-05-10
tags:
  - CSS
---

![parallax scrolling](/images/comprehensive/parallax-scrolling.png)

视差滚动（Parallax Scrolling）是指让多层背景以不同的速度移动，形成立体的运动效果。

所以，在使用视差滚动技术的页面上通常有许多元素在相互独立地滚动着，如果来对其它分层的话，可以有两到三层 ：背景层，内容层，贴图层。

其中，背景层的滚动速度最慢，贴图层次之，最后是内容层，内容层的滚动速度通常可以和页面的滚动速度保持一致。

实现视差滚动效果的方式有许多，包括固定背景、绝对定位和滚动事件等。

## 固定背景

固定背景是最简单的实现方式。默认情况下，背景图像的位置会随着包含它的区块滚动，但我们可以通过 `background-attachment` 属性来改变这一行为。

| 取值   | 说明                                                                         |
| :----- | :--------------------------------------------------------------------------- |
| scroll | 相对于元素本身固定，随着包含它的区块滚动。                                   |
| fixed  | 相对于视口固定，不会随着元素的内容滚动。                                     |
| local  | 相对于元素的内容固定，如果一个元素拥有滚动机制，背景将会随着元素的内容滚动。 |

当设置为 `fixed` 时，随着页面滚动内容和背景图之间就会存在错位的情况，从视角上来看会有一种层次感。

```html
<style>
  .parallax-item {
    background-attachment: fixed;
  }
</style>

<main class="parallax-container">
  <section class="parallax-item">1</section>
  <section class="parallax-item">2</section>
  <section class="parallax-item">3</section>
  <section class="parallax-item">4</section>
</main>
```

[查看完整示例][parallax_bg]。

## 绝对定位

在固定背景的实现方式上，我们主要是利用 CSS 属性将背景图像相对于视口进行固定，而这一点使用 `position` 属性可以达到同样的效果。

| 取值     | 说明                                                                                           |
| :------- | :--------------------------------------------------------------------------------------------- |
| static   | 使用正常的布局行为，即元素在文档常规流中当前的布局位置。                                       |
| relative | 元素先放置在未添加定位时的位置，再在不改变页面布局的前提下调整元素位置。                       |
| absolute | 元素会被移出正常文档流，通过指定元素相对于最近的非 static 定位祖先元素的偏移，来确定元素位置。 |
| fixed    | 元素会被移出正常文档流，相对于屏幕视口的位置来指定元素位置。                                   |
| sticky   | 元素根据正常文档流进行定位，随滚动超过给定阈值后表现得像绝对定位。                             |

可见，当把一个元素设置为绝对定位时该元素也是相对于视口进行固定的，那么我们可以选择将一个元素进行固定来作为背景图像。

```html
<style>
  .fixed {
    position: fixed;
    z-index: -1;
  }
</style>

<main class="parallax-container">
  <section class="parallax-item">
    <div class="fixed"></div>
    <div class="content">1</div>
  </section>
  <section class="parallax-item">2</section>
  <section class="parallax-item">3</section>
  <section class="parallax-item">4</section>
</main>
```

示例中我们将 `.fixed` 元素设为绝对定位，并将其堆叠值设为 -1 以达到背景图像的效果，这样后面的内容就会浮在其上，实现错位。

[查看完整示例][parallax_fixed]。

## CSS3 3D 转换

CSS transforms 由一系列 CSS 属性实现，通过使用这些属性，可以对 HTML 元素进行线性仿射变形。变形包括旋转，倾斜，缩放以及位移，这些变形同时适用于平面与三维空间。

在使用 3D 转换实现视差滚动之前，我们先来了解将会涉及到的几个关键属性。

| 属性            | 说明                                                                  |
| :-------------- | :-------------------------------------------------------------------- |
| transform       | CSS transform 属性允许你旋转，缩放，倾斜或平移给定元素。              |
| transform-style | 设置元素的子元素是位于 3D 空间中还是平面中。                          |
| perspective     | 指定了观察者与 z=0 平面的距离，使具有三维位置变换的元素产生透视效果。 |

CSS 属性 `perspective` 属性值设置与对象平面的距离，或者换句话说，设置透视的强度。

![css coordinate](/images/comprehensive/css-coordinate.jpg)

当 z>0 时三维元素比正常大，而 z<0 时则比正常小，这很符合我们近大远小的道理。那么如何借此实现视差滚动呢？

```html
<main class="parallax-container">
  <section class="parallax-item">1</section>
  <section class="parallax-item">2</section>
  <section class="parallax-item">3</section>
  <section class="parallax-item">4</section>
</main>
```

首先，需要给容器设置上相应的属性，让其子元素是位于 3D 空间中：

```css
.parallax-container {
  height: 100vh;
  overflow-x: hidden;
  overflow-y: scroll;
  perspective: 2px;
}
```

然后，就是让其中的一些子元素在 Z 轴上进行平移，这时子元素在 Z 轴方向距离屏幕的距离就存在了差异：

```css
.parallax-item:nth-child(odd) {
  transform: translateZ(-1px) scale(1.5);
  transform-style: preserve-3d;
  z-index: -1;
  background-size: cover;
}
```

现在，滚动滚动条，由于子元素相对屏幕存在不同的距离，我们视觉上看起来它们的滚动距离和速度也是不一样的，由此达到了滚动视差的效果。

[查看完整示例][parallax_transform]。

### 为什么是放大 1.5 倍

我们使用 `translateZ()` 将子元素向后推会使其在透视上占的比例更小，为了让元素产生视差滚动并保持同样的大小，我们使用了 `scale()` 进行缩放。

在上面的代码中，透视距离是 2px，视差子元素的 Z 轴距离是 -1px。这样的话元素需要放大 1.5 倍，那么是怎么得来的呢？

![similar triangles](/images/comprehensive/similar-triangles.png)

由图可见我们的物体（de）在使用视差后实际看到的是屏幕（be）的大小，为了还原真实的大小我们就需要知道 be/de 之间的比值。

根据相似三角形的判定方法：平行于三角形一边的直线截其它两边所在的直线，截得的三角形与原三角形相似。我们可以判定三角形 abc 和三角形 ade 是相似三角形。

因此，这里 be/de 的值实际上就是 ae/af 的值，也就是 2/3。可见物体被缩小了 1.5 倍，为了还原大小我们只需要再放大 1.5 倍。

## 滚动事件

视差滚动最大的魅力就是展示内容的立体效果，正如上面所言，这种效果主要是由不同物体以不同的速度进行移动而产生的，在超级玛丽中可见如此。

当马里奥移动时，墙块和路上的障碍物和马里奥在同一平层，移动速度最快。天上的白云作为中层背景图像，移动速度次之。而远方的山丘，移动速度最慢。

![mario](/images/comprehensive/mario.png)

三个层次的内容按照不同速度移动，并呈现了立体的视差效果。

既然我们已经了解了视差滚动的基本原理，那么通过 JavaScript 来实现也就不再话下了，而且借助脚本的力量我们还可以创建更加丰富和有趣的效果。

现在，我们先按照上面的逻辑在容器下创建三个元素，分别代表不用的视图层：

```html
<main class="parallax-container">
  <section class="parallax-item">1</section>
  <section class="parallax-item">2</section>
  <section class="parallax-item">3</section>
</main>
```

为了便于区分我们给每一项都设置不同的大小，并加上不同颜色：

```css
.parallax-item:nth-child(1) {
  width: 200px;
  height: 200px;
  background-color: red;
}

.parallax-item:nth-child(2) {
  width: 300px;
  height: 300px;
  background-color: green;
}

.parallax-item:nth-child(3) {
  position: absolute;
  height: 400px;
  background-color: blue;
}
```

在页面的滚动过程中，我们获取页面的 `scrollTop` 的值，然后根据不同的系数去更新各视图层的 `top` 值，如此不同的速度就有了。

为了让 `top` 值生效，在样式上我们还需要使用定位，并最好将各个元素放置在不同的位置，这样对比起来更明显：

```css
.parallax-container {
  position: relative;
  height: 300vh;
}

.parallax-item:nth-child(1) {
  position: absolute;
  top: 650px;
  left: 15%;
}

.parallax-item:nth-child(2) {
  position: absolute;
  top: 550px;
  left: 35%;
}

.parallax-item:nth-child(3) {
  position: absolute;
  top: 720px;
  left: 55%;
}
```

之后，就是通过监听滚动事件来更新各个视图层的位置了：

```js
const parallaxOne = document.querySelector('.parallax-item:nth-child(1)');
const parallaxTwo = document.querySelector('.parallax-item:nth-child(2)');
const parallaxThreen = document.querySelector('.parallax-item:nth-child(3)');
const initTopOne = parseInt(getComputedStyle(parallaxOne).top);
const initTopTwo = parseInt(getComputedStyle(parallaxTwo).top);
const initTopThree = parseInt(getComputedStyle(parallaxThreen).top);

function render() {
  const scrollTop =
    document.documentElement.scrollTop || document.body.scrollTop;

  parallaxOne.style.top = `${initTopOne + scrollTop * 0.6}px`;
  parallaxTwo.style.top = `${initTopTwo + scrollTop * 0.4}px`;
  parallaxThreen.style.top = `${initTopThree + scrollTop * 0.2}px`;
}

addEventListener('scroll', render);
```

[查看完整示例][parallax_event]。

## 综合

在上面我们已经了解了使用 CSS 或 JavaScript 实现视差滚动的方式。事实上，不仅仅是速度，包括大小和能见度也可以作为辅助视差的方式。

下面是一个简单的纯 CSS 实现的动画效果：

![七夕](/images/comprehensive/qixi.png)

可见 CSS 的动画能力已经很不错了，再结合脚本配合起来，发挥想象并能创建一些有趣的视差动画。

[查看完整示例][css_animation]。

## 参考

- [background-attachment - CSS（层叠样式表） | MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/background-attachment)
- [使用 CSS 变形 - CSS（层叠样式表） | MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Transforms/Using_CSS_transforms)
- [[译] 高性能视差滚动](https://juejin.cn/post/6844903488481312776)
- [基于 CSS3-perspective 的视差滚动 - 简书](https://www.jianshu.com/p/edfab381562d)
- [视差滚动的爱情故事 | AlloyTeam](http://www.alloyteam.com/2014/01/parallax-scrolling-love-story/)
- [Pure CSS Parallax in 5 Minutes](https://themes.artbees.net/blog/pure-css-parallax-in-5-minutes/)
- [How CSS Perspective Works | CSS-Tricks](https://css-tricks.com/how-css-perspective-works/)
- [好吧，CSS3 3D transform 变换，不过如此！ « 张鑫旭-鑫空间-鑫生活](https://www.zhangxinxu.com/wordpress/2012/09/css3-3d-transform-perspective-animate-transition/)

[parallax_bg]: https://kisstar.github.io/demo/parallax/content/bg.html
[parallax_fixed]: https://kisstar.github.io/demo/parallax/content/fixed.html
[parallax_transform]: https://kisstar.github.io/demo/parallax/content/transform.html
[parallax_event]: https://kisstar.github.io/demo/parallax/content/event.html
[css_animation]: https://kisstar.github.io/demo/parallax/content/css-animation.html
