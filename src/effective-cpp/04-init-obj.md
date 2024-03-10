# 确定对象被初始化

永远在使用对象之前先将它初始化。

对于无任何成员的内置类型，你必须手工完成此事。至于内置类型以外的任何其他东西，确保每一个构造函数都将对象的每一个成员初始化。

## 初始化和赋值

需要注意的是不要混淆初始化与赋值：

```cpp
class Animal
{
public:
    Animal(const std::string &animal_name);

private:
    std::string name;
};

Animal::Animal(const std::string &animal_name)
{
    this->name = animal_name; // 此为赋值而非初始化
}
```

对象的成员变量的初始化动作发生在进入构造函数本体之前，较佳写法是使用所谓的 member initialization list(成
员初值列)替换赋值动作：

```cpp
Animal::Animal(const std::string &animal_name) : name(animal_name)
{
}
```

改进版的 name 直接使用 animal_name 作为初值进行 copy 改造。

## non-local static 对象

函数内的 static 对象称为 local static 对象（因为它们对函数而言是 local)，其他 static 对象称为 non-local static 对象。

所谓编译单元是指产出单一目标文件的那些源码。基本上它是单一源码文件加上其所含入的头文件。

如果某编译单元内的某个 non-local static 对象的初始化动作使用了另一编译单元内的某个 non-local static 对象，它所用到的这个对象可能尚未被初始化，因为 C++ 对“定义于不同编译单元内的 non-local static 对象”的初始化次序并无明确定义。

为了解决这个问题我们结合 Singletons 模式以函数调用的方式替换直接访问 non-local static 对象：

```cpp
// reference-returning 函数
class FileSystem
{
};
FileSystem &tfs()
{
    static FileSystem fs;
    return fs;
}
```

现在，在我们首次调用 tfs() 函数时将会初始化 fs 对象，如果你从未调用 non-local static 对象的“仿真函数”，就绝不会引发构造和
析构成本。

> 任何一种 non-const static 对象，不论它是 local 或 non-local,在多线程环境下“等待某事发生”都会有麻烦。
>
> 处理这个麻烦的一种做法是：在程序的单线程启动阶段手工调用所有 reference-returning 函数，这可消除与初始化有关的“竞速形势”。

## 小结

- 内置型对象进行手工初始化，因为 C++不保证初始化它们。
- 构造函数最好使用成员初值列，而不要在构造函数本体内使用赋值操作。初值列列出的成员变量，其排列次序应该和它们在 class 中的声明次序相同。
- 为免除“跨编译单元之初始化次序”问题，请以 local static 对象替换 non-local static 对象。
