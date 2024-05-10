// find file or piece of file

import { type Context } from "koa";

import { FilePieceService } from "@packages/backend_utils";
import { fileStorageRoot, FIND_FILE } from "../setting";

/**
 * 执行文件搜索操作。
 * @param params 包含要查找的文件的hash和索引的参数对象。
 * @param storageRoot 文件存储的根目录路径。
 * @returns 返回文件索引是否存在的情况。
 */
const doSearch = async (params: any, storageRoot: string) => {
  const { hash, name, index } = params;
  // 创建文件片段服务实例，并使用提供的hash和存储根目录进行初始化
  const pieceService = new FilePieceService({ hash: hash!, storageRoot });

  return (index || name) && (await pieceService.isExist(index, name)); // 检查指定索引的文件片段是否存在
};

/**
 * 执行切片搜索操作。
 * @param params 包含要查找的文件hash中全部已上传的切片。
 * @param storageRoot 文件存储的根目录路径。
 * @returns 返回文件切片的列表数组。
 */
const searchChunk = async (params: any, storageRoot: string) => {
  const { hash, name } = params;
  // 创建文件片段服务实例，并使用提供的hash和存储根目录进行初始化
  const pieceService = new FilePieceService({ hash: hash!, storageRoot });
  const res = await pieceService.ls(); // 检查指定索引的文件片段是否存在
  return res;
};

/**
 * 处理查找文件的控制器逻辑。
 * @param ctx 包含请求和响应信息的上下文对象。
 * @returns 返回一个表示文件是否存在的响应对象。
 */
export const findFileController = async (
  { index, hash, name },
  fileStorageRoot: string
) => {
  const params = {
    index: parseInt(index) || undefined,
    hash,
    name,
  } as any;

  const isExist = await doSearch(params, fileStorageRoot);
  // 构建并返回响应对象
  return {
    code: 0,
    data: { exists: isExist, type: FIND_FILE },
  } satisfies any;
};

/**
 * 查询文件中已上传的分片
 * @param ctx 包含请求和响应信息的上下文对象。
 * @returns 返回一个表示文件是否存在的响应对象。
 */
export const findChunkController = async ({ hash, name }) => {
  const params = {
    hash,
    name,
  } as any;
  // 执行文件搜索操作
  const hashList = await searchChunk(params, fileStorageRoot);
  // 构建并返回响应对象
  return {
    code: 0,
    data: { hashList },
  } satisfies any;
};
