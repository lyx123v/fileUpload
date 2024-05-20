export interface FilePieceArray {
  pieces: FilePiece[]; // 文件分块信息数组
  fileName: string; // 文件名
  percentage: number;
  fileData: File | null;
  hash: string; // 文件hash值
  fileSize?: string | number; // 文件大小
  index: number; // ws处理索引
  totalIndex: number; // 已上传切片索引
  // 上传状态
  status:
    | "resolving" // 解析中
    | "success" // 成功
    | "waiting" // 等待
    | "stop" // 暂停
    | "uploading" // 上传中
    | "done" // 完成
    | "error"; // 错误
}

export interface FilePiece {
  chunk: Blob; // 当前分片的内容
  size: number; // 当前分片的大小
  isUploaded?: boolean; // 当前分片是否已上传
}

/**
 * 将文件拆分为多个固定大小的块。
 * @param file 需要拆分的文件对象。
 * @returns 返回一个包含多个文件块对象的数组，每个对象包含文件块和其大小。
 */
export const splitFile = (file: File) => {
  const chunkSize = dynamicCalculationChunkSize(file.size); // 计算文件块的大小
  const fileChunkList: FilePiece[] = []; // 用于存储拆分后文件块的列表
  let cur = 0; // 当前处理位置
  while (cur < file.size) {
    // 遍历文件直到处理完所有内容
    const piece = file.slice(cur, cur + chunkSize); // 获取当前块
    fileChunkList.push({
      // 将当前块信息添加到列表中
      chunk: piece,
      size: piece.size,
      isUploaded: false,
    });
    cur += chunkSize; // 更新当前处理位置
  }
  return fileChunkList; // 返回拆分后的文件块列表
};

// 动态计算文件块的大小
const dynamicCalculationChunkSize = (fileSize: number): number => {
  const MB100 = 1024 * 1024 * 100; // 100MB 文件
  const GB1 = 1024 * 1024 * 1024 * 1; // 1GB 文件
  if (fileSize < MB100) {
    return 1024 * 1024 * 5; // 5MB 文件
  } else if (fileSize < GB1) {
    return 1024 * 1024 * 10; // 50MB 文件
  } else {
    return 1024 * 1024 * 20; // 100MB 文件
  }
};
