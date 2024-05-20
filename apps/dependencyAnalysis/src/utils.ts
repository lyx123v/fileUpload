import path from "path";
import fs from "fs/promises";

const projectRoot = process.cwd();

// 读取package.json
export async function getProjectPakcageJson() {
  // 项目路径
  const packageJsonPath = path.join(projectRoot, "package.json");
  // 读取文件，防止报错
  try {
    const packageJsonRaw = await fs.readFile(packageJsonPath, "utf-8");
    const packageJson = JSON.parse(packageJsonRaw);
    return packageJson;
  } catch (error) {
    console.error("读取package.json时发生错误:", error);
    return null;
  }
}

// 读取项目的lock文件,返回文件内容和系统路径
export async function getProjectLockFile(
  fileName: string, // 文件名
  entry: string // 相对路径
): Promise<{
  content: any;
  filePath: string;
  nowFileName: string;
}> {
  const lockFiles = ["pnpm-lock.yaml", "yarn.lock", "package-lock.json"];
  let lockFilePath, lockFileContent, lockPath, nowFileName;
  if (lockFiles.includes(fileName)) {
    lockFilePath = path.join(entry);
    lockFileContent = await fs.readFile(lockFilePath, "utf-8");
    lockPath = await readPkgPath(lockFilePath);
    nowFileName = fileName;
  } else {
    // 如果没有找到任何lock文件返回package.json的内容
    lockFilePath = path.join(projectRoot, "package.json");
    lockFileContent = await fs.readFile(lockFilePath, "utf-8");
    lockPath = await readPkgPath();
    nowFileName = "package.json";
  }

  return {
    content: lockFileContent, // 文件内容
    filePath: lockPath, // 文件路径
    nowFileName, // 文件名
  };
}

// 配置信息路径
export const readPkgPath = async (suffix = "package.json"): Promise<string> => {
  const filePath = path.join(__dirname, "..", suffix);
  return filePath;
};

export async function saveJsonToFile(json, filePath) {
  const folderPath = path.resolve(projectRoot, filePath);
  const graphFilePath = path.join(folderPath, "graph.json");

  try {
    // 检查路径是否存在, 不存在创建
    await fs.mkdir(folderPath, { recursive: true });

    // 写入
    await fs.writeFile(graphFilePath, json, "utf-8");
    console.log(`JSON已成功保存到文件: ${graphFilePath}`);
  } catch (error) {
    console.error(`保存JSON到文件错误: ${error}`);
  }
}
