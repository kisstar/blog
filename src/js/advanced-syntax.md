# JavaScript Advanced Syntax

生成器（Generator）是 ES6 中引入的语言特性，其本质是一个可以暂停和恢复执行的函数。

实际上，并没有对应 Generator 构造函数的 JavaScript 实体。只有一个隐藏对象，其是所有由生成器函数创建的对象所共享的原型对象，并且是 Iterator 类的子类。

Generator 构造函数并不是全局可用的。Generator 的实例必须从生成器函数返回。

```js
function* generator() {
  yield 1;
  yield 2;
  yield 3;
}

const gen = generator(); // "Generator { }"

console.log(gen.next().value); // 1
console.log(gen.next().value); // 2
console.log(gen.next().value); // 3
```

yield 是一条双向路（two-way street）：它不仅可以向外返回结果，而且还可以将外部的值传递到 generator 内。

```js
function* gen() {
  // 向外部代码传递一个问题并等待答案
  let result = yield '2 + 2 = ?'; // (*)

  alert(result);
}

let generator = gen();

let question = generator.next().value; // <-- yield 返回的 value

generator.next(4); // --> 将结果传递到 generator 中的 result 变量
```

第一次调用 `generator.next()` 应该是不带参数的（如果带参数，那么该参数会被忽略）。
