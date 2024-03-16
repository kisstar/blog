# C++ 默认提供和调用的函数

当声明一个类时，编译器就会为它声明一个 copy 构造函数、一个 copy assignment 操作符和一个析构函数。此外如果你没有声明任何构造函数，编译器也会为你声明一个 default 构造函数。

> 所有这些自动生成的函数都是 public 且 inline 的。
>
> 编译器产出的析构函数是个 non-virtual，除非这个 class 的 base class 自身声明有 virtual 析构函数（此时函数的虚属性主要来自 base class)。

其中 copy 构造函数和 copy assignment 操作符，编译器创建的版本只是单纯地将来源对象的每一个 non-static 成员变量拷贝到目标对象。

当对象包含引用成员时或者常量成员时，copy assignment 操作符的行为是未定义的：

```cpp
template <class T>
class Namedobject
{
public:
    Namedobject(std::string &name, const T &value) : namevalue(name) {}

private:
    std::string &namevalue;
    // const T objectvalue;
};

int main()
{
    std::string name1("name1");
    std::string name2("name2");

    Namedobject<int> nb1(name1, 1);
    Namedobject<int> nb2(nb1);
    nb1 = nb2; // error
    return 0;
};
```

## 小结

- 编译器可以暗自为 class 创建 default 构造函数、copy 构造函数、copy assignment 操作符，以及析构函数。
- 在一个“内含 reference 成员”或内涵“const 成员”的 class 内支持赋值操作，你必须自己定义 copy assignment 操作符。
- 如果某个 base classes 将 copy assignment 操作符声明为 private，编译器将拒绝为其 derived classes 生成一个 copy assignment 操作符。
