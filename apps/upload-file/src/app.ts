import logger from "koa-pino-logger";
import Koa from "koa";
import KoaWebsocket from "koa-websocket";

// middlewares为中间件文件夹
import { errorCatch } from "./middlewares/error-catch"; // 捕获报错
import { configProvider } from "./middlewares/config"; // 提供文件存储位置
import { defineWebSocketRoutes } from "./controllers"; // 定义路由

export const run = (context: {
  port: number; // 端口号
  fileStorageRoot: string; // 默认文件存储根目录
}) => {
  const port = Number(context.port) || 3000;
  const app = KoaWebsocket(new Koa()); // 创建一个新的Koa应用
  // 使用错误捕获中间件
  app.use(errorCatch());
  // 日志记录中间件
  app.use(logger());
  // 定义webSocket应用的路由
  defineWebSocketRoutes(app, context.fileStorageRoot);

  // 返回一个新的Promise，用于启动应用并监听指定端口。
  return new Promise((resolve, reject) => {
    try {
      // 尝试启动应用并监听指定端口
      app.listen(port, () => {
        // 成功监听端口后，解决Promise
        resolve({ port });
      });
    } catch (e) {
      // 启动失败时，拒绝Promise
      reject(e);
    }
  });
};
