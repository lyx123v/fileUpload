import path from "path";

import { run } from "./app";
import { fileStorageRoot, SERVER_PORT } from "./setting";

async function main() {
  await run({
    port: SERVER_PORT,
    fileStorageRoot: path.resolve(__dirname, fileStorageRoot),
  });
  console.log(`启动于${SERVER_PORT}端口`); // 输出启动信息
}

main(); // 执行主函数
