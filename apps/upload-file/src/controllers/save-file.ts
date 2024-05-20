import { FilePieceService } from "@packages/backend_utils";
import { MERGE_FILE } from "../setting";
import { saveChunkControllerParamsResponse } from "../types";

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
  return {
    code: 0,
    data: { type: MERGE_FILE, index, hash },
  } as saveChunkControllerParamsResponse;
};
