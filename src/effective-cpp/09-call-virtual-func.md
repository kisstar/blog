# 绝不在构造和析构过程中调用虚函数

不要在构造函数和析构函数期间调用 virtual 函数，因为这样的调用不会带来你预想的结果，就算有你也不会高兴。

```cpp
class Transaction
{
public:
    Transaction()
    {
        logTransaction();
    }
    virtual void logTransaction() const = 0;
};

class BuyTransaction : public Transaction
{
public:
    virtual void logTransaction() const;
};

// ...
BuyTransaction b;
```

由于 base class 构造期间 virtual 函数绝不会下降到 derived classes 阶层。

所以，Transaction 构造函数的最后一行调用 virtual 函数 logTransaction，此时被调用的 logTransaction 是 Transaction 内的版本，不是 BuyTransaction 内的版本，即使目前即将建立的对象类型是 BuyTransaction。

事实上，在 derived class 对象的 base class 构造期间，对象的类型是 base class 而不是 derived class。

同理，一旦 derived class 析构函数开始执行，对象内的 derived class 成员变量便呈现未定义值，所以 C++ 视它们仿佛不再存在。

进入 base class 析构函数后对象就成为一个 base class 对象，而 C++ 的任何部分包括 virtual 函数、dynamic casts 等等也就那么看待它。

针对这种情况（无法使用 virtual 函数从 base classes 向下调用），一些替代方案在构造期间，可以藉由“令 derived classes 将必要的构造信息向上传递至 base class 构造函数”替换之而加以弥补：

```cpp
class Transaction
{
public:
    explicit Transaction(const std : string &logInfo);
    void logTransaction(const std::string &logInfo) const; // 如今是个 non-virtual 函数
};

Transaction ::Transaction(const std ::string &logInfo)
{
    logTransaction(logInfo); // 如今是个 non-virtual 调用
}

class BuyTransaction : public Transaction
{
public:
    // 将 log 信息传给 base class 构造函数
    BuyTransaction(parameters) : Transaction(createLogString(parameters))
    {
    }

private:
    static std ::string createLogString(parameters)
};
```

注意此处的静态函数，比起在成员初值列内给予 base class 所需数据，利用辅助函数创建一个值传给 base class 构造函数往往比较方便（也比较可读）。

## 小结

- 在构造和析构期间不要调用 virtual 函数，因为这类调用从不下降至 derived class（比起当前执行构造函数和析构函数的那层）。
