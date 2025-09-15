# 最佳实践

https://cn.vuejs.org/guide/introduction

## computed

在 computed 组合函数中返回复杂类型时，如果每次都返回一个新的对象或数组，那么 computed 就会认为结果发生了变化，从而触发重新计算。

before:

```vue
<script setup>
import { watchEffect, computed, ref } from 'vue';

const count = ref(1);
const isEvenObj = computed((prev) => {
  const newObj = {
    isEven: count.value % 2 === 0
  };

  return newObj;
});

watchEffect(() => {
  console.log('The count is even: ', isEvenObj.value);
});

const addOne = () => (count.value += 1);
const addTwo = () => (count.value += 2);
</script>

<template>
  {{ count }}
  <button @click="addOne">加1</button>
  <button @click="addTwo">加2</button>
</template>
```

从 Vue v3.4 开始，computed 接受的函数中添加了一个参数，这个参数是上一次的计算结果，基于该参数我们可以按需进行对比，如果对结果没有变化，就可以返回上一次的结果，避免重复计算。

after:

```vue
<script setup>
import { watchEffect, computed, ref } from 'vue';

const count = ref(1);
const isEvenObj = computed((prev) => {
  const newObj = {
    isEven: count.value % 2 === 0
  };

  if (prev && prev.isEven === newObj.isEven) {
    return prev;
  }

  return newObj;
});

watchEffect(() => {
  console.log('The count is even: ', isEvenObj.value);
});

const addOne = () => (count.value += 1);
const addTwo = () => (count.value += 2);
</script>

<template>
  {{ count }}
  <button @click="addOne">加1</button>
  <button @click="addTwo">加2</button>
</template>
```

参考：

- [I Didn't Know This Vue Best Practice... - YouTube](https://www.youtube.com/watch?v=9JRT60ESGiI)

## Provide / Inject

多层级嵌套的组件，会形成了一棵巨大的组件树，如果某个深层的子组件需要一个较远的祖先组件中的部分数据时，仅使用 props 则必须将其沿着组件链逐级传递下去，这会非常麻烦，并且中间的组件就算只是透传在对应的数据变化时也会触发重新渲染。

::: code-group

```vue [Parent.vue]
<script setup lang="ts">
import { ref } from 'vue'
import Son from './Son.vue'

const msg = ref('hello world')
</script>

<template>
  <Son :msg="msg"></Son>
  <button @click="msg = 'hello vue3'">change msg</button>
</template>
```

```vue [Son.vue]
<script setup lang="ts">
import { onUpdated } from 'vue'
import Grandson from './Grandson.vue'

defineProps<{ msg: string }>()

onUpdated(() => {
  console.log('onUpdated')
})
</script>

<template>
  <Grandson :msg="msg"></Grandson>
</template>
```

```vue [Grandson.vue]
<script setup lang="ts">
defineProps<{ msg: string }>()
</script>

<template>
  <h1>{{ msg }}</h1>
</template>
```

:::

为了解决这个问题，Vue 提供了 provide 和 inject 组合函数，允许一个祖先组件向其所有子孙后代组件注入一个依赖，无论组件层级有多深，都可以直接访问到该依赖。

::: code-group

```vue [Parent.vue]
<script setup lang="ts">
import { ref, provide } from 'vue'
import Son from './Son.vue'

const msg = ref('hello world')
provide('msg', msg)
</script>

<template>
  <Son></Son>
  <button @click="msg = 'hello vue3'">change msg</button>
</template>
```

```vue [Son.vue]
<script setup lang="ts">
import { onUpdated } from 'vue'
import Grandson from './Grandson.vue'

onUpdated(() => {
  console.log('onUpdated')
})
</script>

<template>
  <Grandson></Grandson>
</template>
```

```vue [Grandson.vue]
<script setup lang="ts">
import { inject } from 'vue'

const msg = inject('msg')
</script>

<template>
  <h1>{{ msg }}</h1>
</template>
```

:::

现在解决了 props 逐级传递的问题，同时也解决了中间组件的重新渲染问题。不过提供和注入之间的类型并不能正确的得到校验，并且你可以在注入组件的任意父级组件上提供内容，这让数据来源变得很不明确。

为了确保提供和注入之间的类型校验，以及数据来源的明确性可以结合 React 中 Context 的实现方式，将数据的创建和注入 API 都在一个父级组件中生成。

::: code-group

```vue [Parent.vue]
<script setup lang="ts">
import { ref} from 'vue'
import Son from './Son.vue'
import { provideContext } from './msg-context'

const msg = ref('hello world')
provideContext(msg)
</script>

<template>
  <Son></Son>
  <button @click="msg = 'hello vue3'">change msg</button>
</template>
```

```vue [Son.vue]
<script setup lang="ts">
import { onUpdated } from 'vue'
import Grandson from './Grandson.vue'

onUpdated(() => {
  console.log('onUpdated')
})
</script>

<template>
  <Grandson></Grandson>
</template>
```

```vue [Grandson.vue]
<script setup lang="ts">
import { injectContext } from './msg-context'

const msg = injectContext()
</script>

<template>
  <h1>{{ msg }}</h1>
</template>
```

```ts [context.ts]
import type { InjectionKey } from 'vue';
import { inject, provide } from 'vue';

export function createContext<ContextValue>(contextName: string) {
  // 提供类型提示
  const injectionKey: InjectionKey<ContextValue | null> = Symbol(contextName);
  // 封装导出一组提供和注入数据的函数
  const provideContext = (contextValue: ContextValue) => {
    return provide(injectionKey, contextValue);
  };
  const injectContext = (defaultValue?: ContextValue) => {
    return inject<ContextValue>(injectionKey) ?? defaultValue;
  };

  return [injectContext, provideContext] as const;
}
```

```ts [msg-context.ts]
import type { Ref } from 'vue';
import { createContext } from './context';

export const [injectContext, provideContext] =
  createContext<Ref<string>>('msg');
```

:::

参考：

- [依赖注入 | Vue.js](https://cn.vuejs.org/guide/components/provide-inject.html)
- [使用 Context 深层传递参数 – React 中文文档](https://zh-hans.react.dev/learn/passing-data-deeply-with-context)
- [The Problem with This Vue Feature (and how to fix it) - YouTube](https://www.youtube.com/watch?v=KT0mI4_6TWE)
