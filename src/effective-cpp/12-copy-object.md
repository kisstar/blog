# 完整拷贝对象

负责拷贝对象的函数包括复制构造函数和赋值运算符（以下统称为拷贝函数），编译器提供的版本会将对象中的所有成员都做一份拷贝。

下面是自己实现的复制构造函数和赋值运算符：

```cpp
class Customer
{
    string name;

public:
    Customer(const Customer &rhs) : name(rhs.name) {}
    Customer &operator=(const Customer &rhs)
    {
        name = rhs.name; // copy rhs's data
        return *this;    // see Item 10
    }
};
```

目前，它工作得很好，假设某一天我们新增了一个数据成员，但是忘记了更新拷贝函数：

```cpp
class Customer
{
    string name;
    Date lastTransaction;
    // ...
};
```

此时，在拷贝函数中执行的就是部分拷贝，如果牵扯到继承时，问题将会变得更不易察觉：

```cpp
class PriorityCustomer : public Customer
{
    int priority;

public:
    PriorityCustomer(const PriorityCustomer &rhs)
        : priority(rhs.priority) {}

    PriorityCustomer &
    operator=(const PriorityCustomer &rhs)
    {
        priority = rhs.priority;
    }
};
```

在上面的示例中，看起来我们似乎复制了 PriorityCustomer 类中所有的数据成员，但实际上我们遗忘了基类中的数据成员。

```cpp
class PriorityCustomer : public Customer
{
    int priority;

public:
    PriorityCustomer(const PriorityCustomer &rhs)
        : Customer(rhs) /* 调用 base class 的 copy 构造函数 */, priority(rhs.priority) {}

    PriorityCustomer &
    operator=(const PriorityCustomer &rhs)
    {
        Customer::operator=(rhs); // 对 base class 的部分进行赋值
        priority = rhs.priority;
    }
};
```

你可能注意到了复制构造函数和赋值运算符中的代码重复，请不要试图在两者之间相互调用来避免代码重复。正确的做法是建立一个新的成员函数给两者调用。这样的函数往往是 private 的，而且常被命名为 init。

## 小结

- Copying 函数应该确保复制“对象内的所有成员变量”及“所有 base class 成分”。
- 不要尝试以某个 copying 函数实现另一个 copying 函数。应该将共同机能放进第三个函数中，并由两个 coping 函数共同调用。
