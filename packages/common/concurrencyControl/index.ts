export class Scheduler {
  queue: any[]; // 任务队列
  max: number; // 最大并发数
  count: number; // 当前并发位置+1
  constructor() {
    this.queue = [];
    this.max = 4;
    this.count = 0;
  }
  add(promiseCreator) {
    this.queue.push(promiseCreator); // 添加任务
    this.run(); // 执行任务
  }
  run() {
    // 循环执行任务, 直到队列为空或者最大并发数
    while (this.count < this.max && this.queue.length) {
      const task = this.queue.shift(); // 获取第一个任务
      task().then(() => {
        // 执行任务
        this.count--;
        this.run();
      });
      // 并发位置+1
      this.count++;
    }
  }
}
// 测试
// const timeout = (time) =>
//   new Promise((resolve) => {
//     setTimeout(resolve, time);
//   });
// const scheduler = new Scheduler();
// const addTask = (time, order) => {
//   scheduler.add(() => timeout(time).then(() => console.log(order)));
// };

// addTask(1000, '1');
// addTask(1000, '2');
// addTask(1000, '3');
// addTask(1000, '4');
// addTask(1000, '5');
// addTask(1000, '6');
// addTask(1000, '7');
// addTask(1000, '8');
