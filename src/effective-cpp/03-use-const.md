# 尽量使用 const

**如果关键字 const 出现在星号左边，表示被指物是常量；如果出现在星号右边，表示指针自身是常量。**

STL 迭代器系以指针为根据塑模出来，所以迭代器的作用就像个 T\* 指针。声明迭代器为 const 就像声明指针为 const 一样：

```cpp
std::vector<int> vec;
// ...
const std::vector<int>::iterator iter = vec.begin(); // iter 的作用像个 T*const
*iter = 10; // 没问题，改变 iter 所指物
++iter; // 错误！iter 是 const

std::vector<int>::const_iterator cIter = vec.begin(); // cIter 的作用像个 const T*
*cIter = 10; // 错误！*cIter 是 const
++cIter; // 没问题，改变 cIter
```

const 最具威力的用法是面对函数声明时的应用。在一个函数声明式内，const 可以和函数返回值、各参数、函数自身（如果是成员函数）产生关联。

**令函数返回一个常量值，往往可以降低因客户错误而造成的意外，而又不至于放弃安全性和高效性**：

```cpp
class Rational
{
    // ...
};
const Rational operator* (const Rational & lhs, const Rational &rhs); // 返回值申明为常量

// 正因为返回值是常量，所以下面的代码才会在编译期正常报错
Rational a, b, c;
if (a * b = C)
{
}
```

## const 成员函数

将 const 实施于成员函数的目的，是为了确认该成员函数可作用于 const 对象身上。

两个成员函数如果只是常量性不同，可以被重载：

```cpp
class TextBlock
{
public:
    const char& operator[](std::size_t position) const // operator[] for const 对象
    {
        return text[position];
    }
    char& operator[](std::size_t position) // operator[] for non-const 对象
    {
        return text[position];
    }
private:
    std::string text;
};
```

上面 const 成员函数和 non-const 成员函数唯一的不同就是前者的返回类型多了一个 const 修饰，为了避免重复代码可以在 non-const 成员函数中调用 const 版本：

```cpp
class TextBlock
{
public:
    const char &operator[](std::size_t position) const
    {
        return text[position];
    }

    char &operator[](std::size_t position)
    {
        return const_cast<char &>(static_cast<const TextBlock &>(*this)[position]);
    };
};
```

## 小结

- 将某些东西声明为 const 可帮助编译器侦测出错误用法。const 可被施加于任何作用域内的对象、函数参数、函数返回类型、成员函数本体。
- 编译器强制实施 bitwise constness，但你编写程序时应该使用“概念上的常量性”。
- 当 const 和 non-const 成员函数有着实质等价的实现时，令 non-const 版本调用 const 版本可避免代码重复。
