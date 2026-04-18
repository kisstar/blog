---
outline: [2, 3]
---

# JavaScript Advanced API

JavaScript 中的某些API 的使用率相对较低，但在一些场合中它们可能会比较有用，下面整理一下以备查询。

## Scheduler

当长时间运行的任务使主线程一直处于繁忙状态，导致其无法执行其他重要工作（例如响应用户输入）时，网页会显得迟缓且无响应。

### scheduler.postTask()

Scheduler 接口的 `postTask()` 方法允许用户选择性地指定任务的最小延迟运行时间、任务优先级以及可用于修改任务优先级和/或中止任务的信号。如果未设置优先级，则任务优先级默认为 "user-visible"。

```js
function myTask2() {
  return 'Task 2: user-blocking';
}

async function runTask2() {
  const result = await scheduler.postTask(myTask2, {
    priority: 'user-blocking'
  });
  console.log(result); // 'Task 2: user-blocking'.
}

runTask2();
```

如果任务优先级永远不需要更改，则应使用 `options.priority` 参数进行设置，同时可以将 AbortSignal（无优先级）或 TaskSignal 传递给 `options.signal` 参数来中止任务。

如果任务优先级可能需要更改，则不得设置 `options.priority` 参数。相反，应该创建一个 TaskController，并将其 TaskSignal 传递给 `options.signal` 参数来控制任务（包括调整优先级）。

### scheduler.yield()

在该方法调用处会暂停调用它的函数的执行，并让位于主线程，从而分解任务让浏览器运行任何待处理的高优先级工作，该函数的其余部分的执行将安排在新的事件循环任务中运行。这样可使网页更具响应性，进而有助于改善 INP。

```js
async function respondToUserClick() {
  giveImmediateFeedback();
  await scheduler.yield(); // Yield to the main thread.
  slowerComputation();
}
```

优先级默认为 "user-visible"，但如果 `yield()` 调用发生在 `Scheduler.postTask()` 回调内，优先级可以继承不同的优先级。

在 `yield` 之后的延续部分会被安排在运行网页已排入队列的任何其他类似任务之前运行，`setTimeout` 或 `scheduler.postTask` 等函数也可用于分解任务，但这些延续通常在所有已排队的新任务之后运行，可能会导致从让出主线程到完成工作之间出现长时间的延迟。

### 其它

`requestIdleCallback` 回调在任何已排队的 setTimeout 回调之后运行。

触发的输入事件监听器通常在通过 `setTimeout(callback, 0)` 排队的任务之前运行。

### 参考

- [使用 scheduler.yield() 拆分长任务  |  Blog  |  Chrome for Developers](https://developer.chrome.com/blog/use-scheduler-yield?hl=zh-cn)
- [Scheduler: postTask() 方法 - Web API | MDN - MDN 文档](https://mdn.org.cn/en-US/docs/Web/API/Scheduler/postTask)
