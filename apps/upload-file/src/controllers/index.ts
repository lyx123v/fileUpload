import { koaBody } from "koa-body"; // 解析提交中间件
import Koa from "koa";
import Router from "@koa/router";

import {
  FIND_FILE,
  CHUNK,
  MERGE_FILE,
  DELETE,
  FIND_CHUNK,
  CHUNK_INDEX,
} from "../setting";
// 上传切片执行方法
import { saveChunkController } from "./save-file";
// 查询文件执行方法
import { findChunkController, findFileController } from "./find";
// 合并文件执行方法
import { deleteFileController, mergeChunksController } from "./merge";
import KoaWebsocket from "koa-websocket";

// 缓存文件切片信息
let cache: any = {};

export const defineWebSocketRoutes = (
  app: KoaWebsocket.App,
  fileStorageRoot: string
) => {
  const router = new Router();
  router.all("/websocket/:id", async (ctx) => {
    // 通过ctx.params.id获取到前端传过来的id
    const ID = ctx.params.id;
    ctx.websocket.on("message", (msg: string | Blob) => {
      console.log(`前端${ID}发来数据`);
      let data: any = null;
      let flg = "";
      let sendData: any = null;

      try {
        data = JSON.parse(msg);
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
          console.log(`记录分片index${sendData.ind}`);
          cache = sendData;
        } else if (data.type === MERGE_FILE) {
          console.log("合并文件");
          mergeChunksController(sendData, fileStorageRoot);
        } else {
          console.error("未知的消息类型");
        }
      } else if (flg === "blob") {
        console.log("分片上传");
        saveChunkController(
          {
            index: cache.ind,
            hash: cache.hash,
            chunk: sendData,
          },
          fileStorageRoot
        ).then((res) => {
          ctx.websocket.send(JSON.stringify(res));
        });
      }
    });
    ctx.websocket.on("close", () => {
      console.log(`前端${ID}关闭了websocket`);
    });
  });

  app.ws.use(router.routes());
};
