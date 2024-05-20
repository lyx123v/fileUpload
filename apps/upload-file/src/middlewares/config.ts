import { type DefaultContext, type Middleware } from "koa";

export const configProvider = (fileStorageRoot: string): Middleware => {
  return async (ctx: DefaultContext, next: () => Promise<void>) => {
    // 为每个请求设置一个可以随时读取文件存储根目录的位置
    ctx.readConfig = () => fileStorageRoot;
    await next();
  };
};
