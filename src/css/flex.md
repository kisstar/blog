---
outline: [2, 3]
---

# Flex 布局

Flex 布局背后的主要思想是让容器能够改变其项目的宽度/高度（和顺序）以最好地填充可用空间（主要是为了适应各种显示设备和屏幕尺寸）。Flex 容器扩展项目以填充可用的可用空间，或缩小项目以防止溢出。

## 基本概念

在 Flex 布局中，容器、项目以及轴是几个比较关键的概念。

- 容器（flex container）：采用 Flex 布局的元素，称为“容器”（flex container），简称“容器”。
- 项目（flex item）：容器的所有子元素自动成为容器成员，称为项目（flex item），简称“项目”。
- 主轴（main axis）：主轴的开始位置（与边框的交叉点）叫做`main start`，结束位置叫做`main end`，项目默认沿主轴排列。
- 交叉轴（cross axis）：与主轴垂直的轴称为交叉轴，交叉轴的开始位置叫做`cross start`，结束位置叫做`cross end`。

项目将按照主轴 （from main-start to main-end ） 或交叉轴 （from cross-start to cross-end ） 进行布局。

![A diagram explaining flexbox terminology. The size across the main axis of flexbox is called the main size, the other direction is the cross size. Those sizes have a main start, main end, cross start, and cross end.](/images/flex-layout.svg)

:::tip 注意
主轴是 Flex 项目布局的主轴，它不一定是水平的，这取决于 flex-direction 属性。
:::

## 常用属性

通过 `display: flex;` 开启 Flex 布局后，可以通过以下容器属性来控制项目的排列方式：

- `flex-flow`：是 flex-direction 属性和 flex-wrap 属性的简写形式，默认值为 row nowrap。
  - `flex-direction`：决定主轴的方向（即项目的排列方向）。
  - `flex-wrap`：决定项目是否换行。
- `justify-content`：定义了项目在主轴上的对齐方式。
- `align-items`：定义项目在交叉轴上如何对齐。
- `align-content`：定义了多根轴线的对齐方式（当横轴上有额外空间时，这会对齐 Flex 容器的行）。如果项目只有一根轴线，该属性不起作用。
- `gap`：定义项目之间的间隔。
- `row-gap`：定义行之间的间隔。
- `column-gap`：定义列之间的间隔。

项目属性：

- `align-self`：允许单个项目有与其他项目不一样的对齐方式，可覆盖 align-items 属性。默认值为 auto，表示继承父元素的 align-items 属性，如果没有则为 stretch。
- `flex`：是 flex-grow, flex-shrink 和 flex-basis 的简写，默认值为 0 1 auto。
  - `flex-grow`：定义项目的放大比例，默认为 0，即如果存在剩余空间，也不放大。
  - `flex-shrink`：定义了项目的缩小比例，默认为 1，即如果空间不足，该项目将缩小。
  - `flex-basis`：定义了在分配多余空间之前，项目占据的主轴空间（main size）。
- `order`：定义项目的排列顺序。

## 属性效果展示

![Flexbox properties](/images/image.png)

## 用例展示

### 文本中间显示省略号

通常使用 text-overflow 可以相当容易地用省略号截断一行文本。但是，该截断发生在文本行的末尾。如果您想在中间截断内容怎么办？

<ph-demo-preview src="/pages/css/flex-text-ellipsis.html" height="100px"></ph-demo-preview>

::: code-group

```html
<div class="k-filename">
    <span class="k-filename-base">这个文件拥有一个非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常长的文件名.</span>
    <span class="k-filename-extension">pdf</span>
</div>
```

```css
.k-filename {
    display: flex;
}

.k-filename-base {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}

.k-filename-extension {
    flex-shrink: 0;
}
```

:::

### 中间按需显示省略号

当容器中包含 2 个项目时，且前者包含了一段不知道长度的文本，那么并可以通过下面的方式让其按需显示省略号。

<ph-demo-preview src="/pages/css/flex-text-ellipsis2.html" height="100px"></ph-demo-preview>

::: code-group

```html
<div class="k-container">
    <span class="k-text">这里有一段很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长的文案</span>
    <span class="k-other">这里是其它内容</span>
</div>
```

```css
.k-container {
    display: flex;
}

.k-text {
    flex: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}

.k-other {
    width: 200px;
    background: lightgreen;
}
```

:::

## 参考

- [弹性盒子 - 学习 Web 开发 | MDN](https://developer.mozilla.org/zh-CN/docs/Learn_web_development/Core/CSS_layout/Flexbox)
- [CSS Flexbox Layout Guide | CSS-Tricks](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
