# 在赋值运算符中处理自我赋值

自我赋值看起很奇怪，但在 C++ 中，它是合法的并且有时候不易被发现：

```cpp
a[i] = a[j];
*p1 = *p2;
void doSomething (const Base &rb, Derived *pd); // rb 和 *pd 也有可能其实是同一对象
```

有时候自我赋值甚至是不安全的：

```cpp
Widget &Widget::operator=(const Widget &rhs)
{
    delete pb;                // stop using current bitmap
    pb = new Bitmap(*rhs.pb); // start using a copy of rhs's bitmap
    return *this;             // see Item 10
}
```

其中，如果 `this == &rhs`（指向同一个对象），就会导致将 pb 指向了一个已经被删除对象。

一个简单的解决办法是，在赋值函数中先判断一下是否是同一个对象：

```cpp
Widget &Widget::operator=(const Widget &rhs)
{
    if (this == &rhs)
        return *this;
    delete pb;                // stop using current bitmap
    pb = new Bitmap(*rhs.pb); // start using a copy of rhs's bitmap
    return *this;             // see Item 10
}
```

不过，如果 Bitmap 在创建的过程中发生错误，那么 pb 仍然会指向一个无效的 Bitmap 对象。

好在通常排列语句顺序可以达到异常安全，比如我们先创建 Bitmap 对象，然后将其指针赋值给 pb，最后再删除原来的 Bitmap：

```cpp
Widget& Widget::operator=(const Widget& rhs){
    Bitmap *pOrig = pb;               // remember original pb
    pb = new Bitmap(*rhs.pb);         // make pb point to a copy of *pb
    delete pOrig;                     // delete the original pb
    return *this;
}
```

在 operator= 函数内手工排列语句（确保代码不但“异常安全”而且“自我赋值安全”）的一个替代方案是，使用所谓的 copy and swap 技术：

```cpp
Widget& Widget::operator=(Widget rhs){
    swap(rhs);                // swap *this's data with
    return *this;             // the copy's
}
```

_如何实现异常安全的 swap 可以参考 29 条款。_

## 小结

- 确保当对象自我赋值时 operator= 有良好行为。其中技术包括比较“来源对象”和“目标对象”的地址、精心周到的语句顺序、以及 copy-and-swap。
- 确定任何函数如果操作一个以上的对象，而其中多个对象是同一个对象时，其行为仍然正确。
