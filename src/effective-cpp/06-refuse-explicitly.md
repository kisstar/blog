# 明确拒绝生成不需要的函数

编译器默认会创建 default 构造函数、copy 构造函数、copy assignment 操作符，以及析构函数。

如果你不想用户使用它们，你就得自行声明它们，并将对应的操作符声明为 private：

```cpp
class Animal
{

private:
    Animal(const Animal &);
    Animal &operator=(const Animal &);
};
```

将连接期错误移至编译期是可能的，只需要将刚刚的做法在一个专门为了阻止 copying 动作而设计的 base class 内进行实现，然后让所有需要阻止 copying 的 class 都继承这个 base class 即可：

```cpp
class Uncopyable
{
protected:
    Uncopyable(){};
    ~Uncopyable() {}

private:
    Uncopyable(const Uncopyable &);
    Uncopyable &operator=(const Uncopyable &)
};

class Animal : private Uncopyable {}
```

## 小结

- 为驳回编译器自动（暗自）提供的机能，可将相应的成员函数声明为 private 并且不予实现。使用像 Uncopyable 这样的 base class 也是一种做法。
