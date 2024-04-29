import { CHUNK_SIZE } from "../const";

export interface FilePieceArray {
  pieces: FilePiece[]; // 文件分块信息数组
  fileName: string; // 文件名
  percentage: number;
  fileData: File | null;
  hash: string; // 文件hash值
  fileSize?: string | number; // 文件大小
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
 * @param chunkSize 每个块的大小，默认为CHUNK_SIZE。
 * @returns 返回一个包含多个文件块对象的数组，每个对象包含文件块和其大小。
 */
export const splitFile = (file: File, chunkSize = CHUNK_SIZE) => {
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
