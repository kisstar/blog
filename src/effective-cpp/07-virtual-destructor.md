# 为基态类声明 virtual 析构函数

C++ 指出，当 derived class 对象经由一个 base class 指针被删除，而该 base class 带着一个 non-virtual 析构函数，其结果是未定义的。_实际执行时通常发生的是对象的 derived 成分没被销毁。_

```cpp
class TimeKeeper
{
public:
    TimeKeeper();
    ~TimeKeeper();
};
class AtomicClock : public TimeKeeper
{
}; // 原子钟

TimeKeeper *ptk = new AtomicClock();
```

上面指针指向一个 Atomicclock 对象，其内的 AtomicClock 成分（也就是声明于 Atomicclock class 内的成员变量）很可能没被销毁，而 AtomicClock 的析构函数也未能执行起来。

然而其 base class 成分（也就是 TimeKeeper 这一部分）通常会被销毁，于是造成一个诡异的“局部销毁”对象。

消除这个问题的做法很简单，就是给 base class 一个 virtual 析构函数：

```cpp
class TimeKeeper
{
public:
    TimeKeeper();
    virtual ~TimeKeeper();
};
```

每一个带有 virtual 函数的 class 都有一个相应的 vtbl。当对象调用某一 virtual 函数，实际被调用的函数取决于该对象的 vptr 所指的那个 vtbl——编译器在其中寻找适当的函数指针。

> vptr 是指向一个由函数指针构成的数组，称为 vtbl(virtual table)。

所以，如果 class 不含 virtual 函数，通常表示它并不意图被用做一个 base class。当 class 不企图被当作 base class，令其析构函数为 virtual 往往是个馊主意。

## 小结

- 如果 class 带有任何 virtual 函数，它就应该拥有一个 virtual 析构函数。
- 带多态性质的 base classes 应该声明一个 virtual 析构函数。
- Classes 的设计目的如果不是作为 base classes 使用，或不是为了具备多态性，就不该声明 virtual 析构函数。
- 如果想拥有抽象的 base class，但没有合适的纯虚函数，则可以为其声明一个纯虚析构函数。
