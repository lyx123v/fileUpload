// 导入脚本
import SparkMD5 from 'spark-md5';
import { type FilePiece } from './file';

// 读取文件分块的内容
const readChunk = file => {
  return new Promise((resolve) => {
    const reader = new FileReader(); // 创建一个FileReader对象
    reader.readAsArrayBuffer(file); // 将文件以ArrayBuffer形式读取
    reader.onload = e => {
      if (e.target) {
        // 文件读取完成后的处理
        resolve(e.target.result); // 解析为读取到的ArrayBuffer
      }
    };
  });
};

/**
 * 计算分块文件的hash值。
 * 此函数为Web Worker中的事件处理器，用于处理来自主线程的消息，消息包含文件的分块列表。
 * 使用SparkMD5库对所有分块进行累加计算，然后返回最终的hash值。
 */
// self是当前Worker的引用，用于接收和发送消息。
self.onmessage = async e => {
  const { fileChunkList } = e.data as { fileChunkList: FilePiece[] };
  const spark = new SparkMD5.ArrayBuffer(); // 初始化SparkMD5用于计算hash

  const len = fileChunkList.length; // 文件分块的数量
  for (let i = 0; i < len; i++) {
    const chunk = fileChunkList[i].chunk; // 当前处理的文件分块
    const res = await readChunk(chunk); // 读取文件分块的内容
    spark.append(res); // 将读取到的分块内容增加到hash计算中

    self.postMessage({
      percentage: ((i + 1) / len) * 100, // 计算并发送当前处理的百分比
    });
  }

  self.postMessage({
    percentage: 100, // 文件处理完成
    hash: spark.end(), // 发送最终的hash值
  });
  self.close(); // 关闭Web Worker
};