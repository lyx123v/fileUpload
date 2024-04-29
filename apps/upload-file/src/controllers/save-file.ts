import fs from "fs/promises";

import { type Context } from "koa";
import { FilePieceService } from "@packages/utils/src/backend";
import { MERGE_FILE } from "../setting";

/**
 * 校验上传分片的参数是否合法
 * @param params 上传分片的参数，包括hash、chunk和index
 * @returns 若参数不合法，返回错误信息字符串；若参数合法，返回true。
 */
const checkParam = (params: any) => {
  if (!params) {
    // 没有参数
    return "Empty params";
  }
  const { hash, chunk, index } = params;
  if (typeof hash !== "string" || hash.length <= 0) {
    // hash值不合法
    return `Empty hash value: ${hash}`;
  }
  if (chunk?.length <= 0) {
    // chunk值不合法
    return `Empty chunk value`;
  }
  if (index < 0) {
    // 序号不合法
    return `Invalid file name `;
  }
  // 校验通过
  return true;
};

/**
 * 将上传的文件分片写入存储
 * @param params 上传分片的参数，包括hash、index和chunk
 * @param storageRoot 文件存储的根目录
 */
const saveChunk = async (params: any, storageRoot: string) => {
  const { hash, index, chunk } = params;
  const pieceService = new FilePieceService({ hash, storageRoot });
  await pieceService.writePiece(chunk, index);
};

/**
 * 处理保存文件分片的请求
 * @param ctx Koa的上下文对象，包含请求和响应的信息
 */
export const saveChunkController = async (
  { index, hash, chunk: chunkFile },
  fileStorageRoot
) => {
  const params = {
    index, // 序号
    hash, // 哈希
    chunk: chunkFile, // 切片
  };
  await saveChunk(params, fileStorageRoot);
  // 返回成功响应
  return { code: 0, data: { type: MERGE_FILE, index, hash } } as any;
};
