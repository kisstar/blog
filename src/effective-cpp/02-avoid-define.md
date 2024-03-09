# 避免使用 #define

尽量使用常量、枚举和内联函数代替 `#define`。或者说尽量使用编译器，而不是预处理器。因为后者定义的宏在预处理阶段就会被替换。

## 常量

在下面的示例中，宏 ASPECT 定义了常量 1.653，在编译时预处理器会将所有 ASPECT 替换为 1.653，所以在编译阶段出现了问题将看不到 ASPECT 的说明，只能看到魔法数字 1.653。

解决之道是以一个常量替换上述的宏：

```cpp
// bad
#define ASPECT RATIO 1.653 // 宏通常用全大写名称

// better
const double AspectRatio 1.653;
```

`#defines` 并不重视作用域。一旦宏被定义，它就在其后的编译过程中有效（除非在某处被 #undef）。

## 宏

另一个常见的 `#define` 误用情况是以它实现宏。

宏看起来像函数，但不会招致函数调用带来的额外开销。下面这个宏夹带着宏实参，调用函数 f:

```cpp
#define CALL_WITH_MAX(a, b) f((a) > (b) ? (a) : (b))
```

在这里，调用 f 之前，a 的递增次数竟然取决于“它被拿来和谁比较”：

```cpp
int a = 5, b = 0;
CALL_WITH_MAX(++a, b);      // a 被累加二次
CALL_WITH_MAX(++a, b + 10); // a 被累加一次
```

为了获得宏带来的效率以及一般函数的所有可预料行为和类型安全性，最好写出 template inline 函数：

```cpp

template <typename T>
// 由于我们不知道 T 是什么，所以采用 pass  by  reference-to-const.
inline void callwithMax(const T &a, const T &b) //
{
    f(a > b ? a : b);
}
```

这个 template 产出一整群函数，每个函数都接受两个同型对象，并以其中较大者作为实参调用 f。

## 小结

- 对于单纯常量，最好以 const 对象或 enums 替换 `#defines`。
- 对于形似函数的宏，最好改用 inline 函数替换 `#defines`。
