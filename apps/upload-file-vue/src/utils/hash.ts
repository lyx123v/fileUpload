// TODO: ?worker是一个查询参数，告诉编译器将该文件编译为Web Worker。这样，在运行时，
// TODO: 该模块将作为一个独立的线程运行，可以执行计算密集型任务，而不阻塞主线程。
import Worker from "./hash-worker.ts?worker";

/**
 * 计算文件块的哈希值。
 * @param {Object} params 包含必要参数的对象。
 * @param {Function} [params.onTick] - 可选回调函数，用于在计算过程中接收进度百分比。
 * @param {any[]} params.chunks - 文件被分割成的块列表。
 * @returns {Promise<string>} 一个承诺，解析为计算出的哈希字符串。
 */
export const calHash = ({ chunks }: { chunks: any[] }): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 创建一个 Worker 来进行哈希计算
    const worker = new Worker();
    worker.postMessage({ fileChunkList: chunks }); // 向 Worker 发送文件块列表
    worker.onmessage = (e) => {
      const { hash } = e.data; // 从 Worker 接收到的哈希值和计算进度
      if (hash) {
        resolve(hash); // 当哈希值计算完毕，解决承诺
      }
    };
  });
};
