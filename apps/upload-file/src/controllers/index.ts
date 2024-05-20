import Router from "@koa/router";

import { FIND_FILE, MERGE_FILE, CHUNK_INDEX } from "../setting";
// 上传切片执行方法
import { saveChunkController } from "./save-file";
// 查询文件执行方法
import { findFileController } from "./find";
// 合并文件执行方法
import { mergeChunksController } from "./merge";
import KoaWebsocket from "koa-websocket";

export const defineWebSocketRoutes = (
  app: KoaWebsocket.App,
  fileStorageRoot: string
) => {
  // 缓存文件切片信息
  let cache = new Map();
  const router = new Router() as any;
  router.all("/websocket/:id", async (ctx) => {
    // 通过ctx.params.id获取到前端传过来的id
    const hashORname = ctx.params.id;
    const HASH = hashORname.split("_")[0];
    const NAME = hashORname.split("_")[1];
    console.log(`文件名：${NAME}，HASH：${HASH}，建立了链接`);
    // 立刻查询文件是否已上传
    findFileController(
      {
        hash: HASH,
        name: NAME,
        index: undefined,
      },
      fileStorageRoot
    ).then((res) => {
      ctx.websocket.send(JSON.stringify(res));
    });
    ctx.websocket.on("message", async (msg: string | Blob) => {
      console.log(`HASH: ${HASH}`);
      let data: any = null;
      let flg = "";
      let sendData: any = null;

      try {
        data = JSON.parse(`${msg}`);
        flg = "string";
        sendData = data.data;
      } catch (error) {
        data = msg;
        flg = "blob";
        sendData = data;
      }
      if (flg === "string") {
        // 字符串信息
        if (data.type === FIND_FILE) {
          console.log("查找文件");
          findFileController(sendData, fileStorageRoot).then((res) => {
            ctx.websocket.send(JSON.stringify(res));
          });
        } else if (data.type === CHUNK_INDEX) {
          console.log(`记录分片index-${sendData.ind}`);
          cache.set(HASH, sendData);
        } else if (data.type === MERGE_FILE) {
          console.log("合并文件");
          mergeChunksController(sendData, fileStorageRoot);
          cache.delete(HASH);
        } else {
          console.error("未知的消息类型");
        }
      } else if (flg === "blob") {
        console.log("分片上传");

        const cacheData = cache.get(HASH);
        const res = await saveChunkController(
          {
            index: cacheData.ind,
            hash: cacheData.hash,
            chunk: sendData,
          },
          fileStorageRoot
        );
        ctx.websocket.send(JSON.stringify(res));
      }
    });
    ctx.websocket.on("close", () => {
      cache.delete(HASH);
      console.log(`前端${HASH}关闭了websocket`);
    });
    ctx.websocket.on("error", (err) => {
      console.log(`前端${HASH}发生了错误${err}`);
    });
  });

  app.ws.use(router.routes());
};
