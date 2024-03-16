# 别让异常逃离析构函数

C++ 并不禁止析构函数吐出异常，但它不鼓励你这样做。考虑下面的情形，我们使用 DBConn 来管理数据库的连接，并通过析构函数来确保数据库连接总是被关闭：

```cpp
class DBConnection // 负责数据库连接的 class
{
public:
    // ...
    static DBConnection create();
    void close();
};

class DBConn // 用来管理 DBConnection 对象
{
public:
    // ...
    ~DBConn() // 确保数据库连接总是会被关闭
    {
        db.close()
    }

private:
    DBConnection db;
};
```

只要调用 close 成功，一切都很正常。但如果该调用导致异常，DBConn 析构函数会传播该异常，那会抛出了难以驾驭的麻烦。

为此我们可以吞掉 close 产生的错误，或者理解结束程序：

```cpp
DBConn:~DBConn (
{
    try
    {
        db.close();
    }
    catch (...)
    {
        // 日志记录 close 的调用失败
        std::abort(); // 终止程序，或者什么也不做
    }

}
```

更为理想的情况是，可以给用户一个机会来处理异常，如果用户觉得不需要则可以忽略它，我们会自动回退到析构函数进行处理。为此，我们可以提供 close 函数：

```cpp
class DBConn
{
public:
    // 供客户使用的新函数
    void close()
    {
        db.close();
        closed true;
    }
    ~DBConn()
    {
        if (closed)
        {
            try
            {
                // 关闭连接（如果客户不那么做的话）
                db.close()
            }
            catch (...)
            {
                // 如果关闭动作失败，记下对 close的 调用失败；
                // 并结束程序，或吞下异常。
            }
        }
    }

private:
    DBConnection db;
    bool closed;
};
```

## 小结

- 析构函数绝对不要吐出异常。如果一个被析构函数调用的函数可能抛出异常，析构函数应该捕捉任何异常，然后吞下它们（不传播）或结束程序。
- 如果客户需要对某个操作函数运行期间抛出的异常做出反应，那么 class 应该提供一个普通函数（而非在析构函数中）执行该操作。
