import Koa from "koa";
import { Context } from "koa";
import Router from "koa-router";
import path from "path";
import { getProjectLockFile } from "./utils";
import { startVueProject } from "@project/dependency-analysis-vue/bootstrap";

import { CLIENT_PORT, PORT } from "./setting";
import { GetGraphControllerResponse } from "./types";
import open from "open";
import { PnpmLockGraph } from "./readFileDependency/pnpm";
import { YarnLockGraph } from "./readFileDependency/yarn";
import { NpmLockGraph } from "./readFileDependency/npm";
import { packagesGraph } from "./readFileDependency/packages";
import { writeFile, mkdir } from "fs/promises";

interface startServer {
  entry: string; // 入口路径
  json: string;
}
// 开启服务器
export const startServer = async ({ entry, json: jsonPath }: startServer) => {
  // 项目路径
  const fileName = path.basename(entry || "");
  // 解析 lock file，需要兼容 npm/yarn/pnpm
  const lockFileClasses = {
    "pnpm-lock.yaml": PnpmLockGraph, // pnpm
    "yarn.lock": YarnLockGraph, // yarn
    "package-lock.json": NpmLockGraph, // npm
    "package.json": packagesGraph, // 特殊情况
  };

  //      内容
  const { content, filePath, nowFileName } = await getProjectLockFile(
    fileName,
    entry
  );
  const LockGraphClass = lockFileClasses[nowFileName];
  await processLockFile(
    LockGraphClass,
    { content, lockPath: filePath },
    jsonPath
  );
};

// 处理解析LockFile的共通部分
async function processLockFile(lockFileClass, lockFileInfo, jsonPath) {
  const lockParser = new lockFileClass(lockFileInfo);
  const lockData = await lockParser.parse();
  if (jsonPath) {
    saveJsonToFile(lockData, jsonPath);
  } else {
    startLockApiServer(lockData);
  }
}

// 启动解析LockFile服务器并提供API
const startLockApiServer = async (data: any) => {
  const app = new Koa();
  const router = new Router();

  app.use(async (ctx: Context, next: () => Promise<void>) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    ctx.set({ "Content-Type": "application/json; charset=utf-8" });
    ctx.set("Access-Control-Allow-Origin", "*");
    ctx.set("Access-Control-Allow-Headers", "*");
    if (ctx.request.method === "OPTIONS") {
      ctx.status = 200;
      ctx.body = "success";
      return;
    }
    await next();
  });

  router.get("/api/graph", async (ctx: Context, next: () => Promise<void>) => {
    try {
      if (data) {
        ctx.body = {
          code: 0,
          data,
        } as GetGraphControllerResponse;
      }
    } catch (error) {
      ctx.body = {
        code: 1,
        data: { graph: [], nodeArray: [] },
      } as GetGraphControllerResponse;
    }
    await next();
  });

  app.use(router.routes()).use(router.allowedMethods());

  app.listen(PORT, () => {
    console.log(`app started at port ${PORT}...`);
  });
  startVueProject();
  await open(`http://localhost:${CLIENT_PORT}/`);
};

// 保存json到文件
export async function saveJsonToFile(lockData, filePath) {
  // process.cwd(): node命令执行的位置
  const folderPath = path.resolve(process.cwd(), filePath);
  const lockFilePath = path.join(folderPath, "lockFile.json");
  // 检查路径是否存在, 不存在则创建
  await mkdir(folderPath, { recursive: true });
  // 写入

  await writeFile(lockFilePath, new Buffer(JSON.stringify(lockData)), "utf-8");
  console.log(`JSON已成功保存到文件: ${filePath}`);
}
