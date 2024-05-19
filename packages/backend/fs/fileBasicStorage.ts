import path from "path";
import {
  stat,
  readFile,
  writeFile,
  mkdir,
  readdir,
  unlink,
  rmdir,
  // 这个 rename 没有用到
  rename,
} from "fs/promises";

// 咋又从 fs 导入了？
import { PathLike, RmDirOptions, StatOptions } from "fs";
import { isValidString } from "@packages/common_utils";

export class FileBasicStorage {
  // 判断文件是否存在，存在返回(异步) true，否则返回(异步)  false
  async isFileExists(filename: PathLike, opts?: StatOptions) {
    try {
      const fStat = await stat(filename, opts);
      return fStat.isFile();
    } catch (e) {
      return false;
    }
  }

  // 是否表示一个存在的目录，存在返回(异步) true，否则返回(异步)  false
  async isDirExists(filename: PathLike, opts?: StatOptions) {
    try {
      const fStat = await stat(filename, opts);
      return fStat.isDirectory();
    } catch (e) {
      return false;
    }
  }

  // 列出文件夹下所有文件
  async ls(dir: string) {
    if (await this.isDirExists(dir)) {
      const res = await readdir(dir);
      return res.map((r) => path.resolve(dir, r));
    }
    throw new Error(`Dir ${dir} not exists`);
  }

  // 读
  readFile(filename: string, options?: { encoding?: null; flag?: string }) {
    return readFile(filename, options);
  }

  // 写
  async writeFile(
    filename: string,
    content: Buffer,
    options?: { encoding?: null; flag?: string }
  ) {
    await writeFile(filename, content, options);
  }

  // 确保指定的目录存在。如果目录不存在，则会使用mkdir方法递归创建该目录。
  // { recursive: true }表示以递归方式创建目录，即如果目录的上级目录不存在
  async ensureDir(dir: string) {
    await mkdir(dir, { recursive: true });
  }

  // 删除指定文件名称的文件
  async unlink(path: PathLike) {
    await unlink(path);
    return true;
  }

  // 删除目录
  async rmdir(path: PathLike, options?: RmDirOptions) {
    return await rmdir(path, options);
  }

  // 删除目录及其下所有文件
  async rmdirAll(path: string) {
    if (await this.isDirExists(path)) {
      const files = await this.ls(path);
      for (const file of files) {
        if (await this.isDirExists(file)) {
          await this.rmdirAll(file);
        } else {
          await this.unlink(file);
        }
      }
      await this.rmdir(path);
    }
  }

  /**
   * 将多个文件内容合并，并保存为一个新文件。
   * @param files 要合并的文件路径数组。
   * @param saveAs 合并后文件的保存路径。
   * @throws 如果任何输入文件路径或保存路径无效，或任何输入文件不存在，将抛出错误。
   */
  async combind(files: string[], saveAs: string) {
    // 检查文件路径和保存路径的有效性
    if (files?.some((r) => !isValidString(r)) || !isValidString(saveAs)) {
      throw new Error(`Invalid file paths`);
    }

    // 异步读取所有文件内容
    const contents = await Promise.all(
      files.map(async (r) => {
        // 检查文件是否存在
        if ((await this.isFileExists(r)) !== true) {
          throw new Error(`file ${r} not exists`);
        }
        // 读取文件内容
        return this.readFile(r);
      })
    );
    // 合并所有文件内容
    const combindedContent = Buffer.concat(contents);
    // 将合并后的内容写入指定文件
    await this.writeFile(saveAs, combindedContent);
  }
}

export const fsStorage = new FileBasicStorage();
