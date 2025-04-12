# 工厂方法模式

在工厂方法模式（Factory Method Pattern）中，工厂父类负责定义创建对象的公共接口，而工厂子类则负责生成具体的产品对象。

> 工厂方法模式又称为工厂模式，也叫虚拟构造器模式或者多态工厂模式，它属于类创建型模式。

## 示意图

![Factory Method Pattern](../public/images/image-12.png)

## 示例代码

```typescript
abstract class MilkTea {}

class BubbleTea extends MilkTea {}

class FruitTea extends MilkTea {}

abstract class MilkTeaFactory {
  abstract create(): MilkTea;
}

class BubbleTeaFactory extends MilkTeaFactory {
  create(): BubbleTea {
    return new BubbleTea();
  }
}

class FruitTeaFactory extends MilkTeaFactory {
  create(): FruitTea {
    return new FruitTea();
  }
}

// usage
function makeMilkTea(factory: MilkTeaFactory): void {
  const milkTea = factory.create();
}
```

## 优缺点

### 优点

- **封装性**：隐藏了产品的具体实现，使得新增产品类时不需要修改抽象工厂和抽象产品提供的接口，无须修改客户端，也无须修改其他的具体工厂和具体产品。
- **扩展性**：易于增加新的产品类型，只需添加相应的子类和对应的工厂即可。

### 缺点

- 每新增一个产品，就需要新增一个对应的工厂类和产品类，在一定程度上增加了系统的复杂度。

## 应用场景

- 工厂方法用于隔离对象的使用和具体类型之间的耦合关系。面对一个经常变化的具体类型，紧耦合关系（new）会导致软件的脆弱。
- 解决“单个对象”的需求变化。
