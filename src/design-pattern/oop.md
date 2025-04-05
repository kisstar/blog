# 面向对象设计

变化是复用的天敌，面向对象设计最大的优势在于：抵御变化！

面向对象程序设计（英语：Object-oriented programming，缩写：OOP）是种具有对象概念的编程典范，同时也是一种程序开发的抽象方针。它可能包含数据、特性、代码与方法。

## 抽象

对象是什么？

- 从语言层面来看，对象封装了代码和数据
- 从规格面讲，对象是一系列可被使用的公共接口
- 从概念层面讲，对象是某种拥有责任的**抽象**

抽象是，由于不能掌握全部的复杂对象，我们选择忽略它的非本质细节，而去处理泛化和理想化了的对象模型。

- 抽象主要是隐藏方法的实现，让调用者只关心有哪些功能而不是关心功能的实现
- 抽象可以提高代码的可扩展性和维护性，修改实现不需要改变定义，可以减少代码的改动范围

在下面的示例中只要实现了 IStorage 接口的对象都可以被 User 使用。

```ts
interface IStorage {
  save(key: any, value: any): void;
  read(key: any): void;
}

class User {
  constructor(public name: string, public storage: IStorage) {}

  save() {
    this.storage.save('userInfo', JSON.stringify(this));
  }

  read() {
    return this.storage.read('userInfo');
  }
}
```

## 三大特征

面向对象编程（OOP）的三大特性包括：封装、继承和多态。

- 封装，隐藏内部实现，确保数据的完整性和安全性
- 继承，减少重复代码，提高代码复用性和可维护性
- 多态，改写对象行为，可以编写更加通用、可扩展的代码，提高代码的灵活性
