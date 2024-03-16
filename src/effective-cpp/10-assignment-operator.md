# 赋值运算符应返回自己的引用

赋值运算符的编程惯例，可以支持链式的赋值语句：

```cpp
int a, b, c;

a = b = c = 1; // 链式赋值语句
```

链式赋值已经成为了惯例，所以我们自定义的对象最好也能支持链式的赋值，为此我们需要重载赋值运算符，让其返回一个指向操作符左侧的引用：

```cpp
class Widget {
public:
    Widget& operator=(const Widget& rhs){   // return type is a reference to
      return *this;                         // return the left-hand object
    }
    Widget& operator+=(const Widget& rhs){  // the convention applies to
       return *this;                        // +=, -=, *=, etc.
    }
};
```

## 小结

- 让赋值操作符返回一个指向自身的引用。
