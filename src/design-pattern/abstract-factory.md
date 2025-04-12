# 抽象工厂模式

抽象工厂模式（Abstract Factory Pattern）提供一个创建一系列相关或相互依赖对象的接口，而无须指定它们具体的类。

> 抽象工厂模式又称为 Kit 模式，属于对象创建型模式。

## 示意图

![Abstract Factory Pattern](../public/images/image-10.png)

## 示意代码

以奶茶为例，我们想制作不同类型的奶茶，比如 BubbleTea、FruitTea，它们可能属于不同的品牌，比如 Mixue、HEYTEA。每个品牌都有自己的制作方法。

```typescript
interface BubbleTea {
    makeBubbleTea(): string;
}

interface FruitTea {
    makeFruitTea(): string;
}

class MixueBubbleTea implements BubbleTea {
    public makeBubbleTea() {
        return 'Mixue Bubble Tea';
    }
}

class HEYTEABubbleTea implements BubbleTea {
    public makeBubbleTea() {
        return 'HEYTEA Bubble Tea';
    }
}

class MixueFruitTea implements FruitTea {
    public makeFruitTea() {
        return 'Mixue Fruit Tea';
    }
}

class HEYTEAFruitTea implements FruitTea {
    public makeFruitTea() {
        return 'HEYTEA Fruit Tea';
    }
}

interface DrinkFactory {
    createBubbleTea(): BubbleTea;
    createFruitTea(): FruitTea;
}

class MixueDrinkFactory implements DrinkFactory {
    public createBubbleTea() {
        return new MixueBubbleTea();
    }

    public createFruitTea() {
        return new MixueFruitTea();
    }
}

class HEYTEADrinkFactory implements DrinkFactory {
    public createBubble Tea() {
        return new HEYTEABubbleTea();
    }

    public createFruitTea() {
        return new HEYTEAFruitTea();
    }
}

// usage
function makeDrink(factory: DrinkFactory) {
    const bubbleTea = factory.createBubbleTea();
    const fruitTea = factory.createFruitTea();
}
```

## 优缺点

### 优点

- 封装性好，在增加新的产品系列时不需要修改抽象层代码。
- 扩展性高，在增加新产品族时只需要添加一个工厂类即可。

### 缺点

- 难以应对“新对象”的需求变动（在添加新的产品对象时，难以扩展抽象工厂来生产新种类的产品）。

## 使用场景

- 当系统中有多个产品族，并且各产品族在特定系列下的对象之间有相互依赖、或作用的关系，产品族之间可以相互独立变化时；
- 抽象工厂模式主要在于应对“新系列”的需求变动。
