// find file or piece of file

import { FilePieceService } from "@packages/backend_utils";

/**
 * 执行合并碎片的操作
 * @param params 合并碎片控制器的参数，包含hash
 * @param storageRoot 存储根目录
 * @returns 返回合并结果
 */
const doMerge = async (params: any, storageRoot: string) => {
  const { hash, name } = params;
  const pieceService = new FilePieceService({ hash: hash!, storageRoot });

  const res = await pieceService.merge(name);
  return res;
};

/**
 * 执行删除文件的操作
 * @param params 合并碎片控制器的参数，包含hash
 * @param storageRoot 存储根目录
 * @returns 返回合并结果
 */
const delFile = async (params: any, storageRoot: string) => {
  const { hash, name } = params;
  const pieceService = new FilePieceService({ hash: hash!, storageRoot });
  const res = await pieceService.delete(name);
  return res;
};

/**
 * 处理合并碎片的控制器请求
 * @param ctx 上下文对象，包含请求和配置信息
 * @returns 返回合并结果的响应体
 */
export const mergeChunksController = async (
  { hash, name },
  fileStorageRoot
) => {
  const params = {
    hash,
    name,
  } as any;
  // 执行合并操作
  await doMerge(params, fileStorageRoot);
};
