import { type DefaultContext, type Middleware } from "koa";

/**
 * 创建一个错误捕获的中间件。
 * 该中间件用于捕获应用中未处理的异常，并统一处理错误响应。
 *
 * @returns 返回一个中间件函数。
 */
export const errorCatch = (): Middleware => {
  return async (ctx: DefaultContext, next: () => Promise<void>) => {
    try {
      await next(); // 执行后续中间件
    } catch (err) {
      // 输出错误信息
      console.error(err);
      // 设置响应体
      ctx.body = {
        code: 500,
        message: "服务器内部错误",
      };
    }
  };
};
