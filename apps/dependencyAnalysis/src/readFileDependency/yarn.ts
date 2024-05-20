import * as lockfile from "@yarnpkg/lockfile";
import {
  IGraphData,
  IGraphProps,
  ILockFileOptions,
  INodeArrayProps,
} from "../types";
import { baseDepGraph } from "./base";

interface IYarnFileEntry {
  version: string; // 版本号
  resolved?: string; // 链接
  integrity?: string; // 签名
  dependencies?: Record<string, string>; // 依赖
}

const parseFromSpecify = (specifier: string) => {
  const REGEXP = /^((?:@[^/]+\/)?[^@/]+)@(.+)$/;
  const match = specifier.match(REGEXP);
  if (match) {
    const [, name, , localVersion, version] = match;
    return {
      name, // 名称
      specifier, // 完整依赖数据
      localVersion, // 本地版本
      version, // 远程版本
    };
  }
  return {
    name: "", // 名称
    specifier, // 完整依赖数据
    localVersion: "", // 本地版本
    version: "", // 远程版本
  };
};

export class YarnLockGraph extends baseDepGraph {
  private content: string;

  constructor(options: ILockFileOptions) {
    super();
    this.content = options.content;
  }

  async parse(): Promise<IGraphData> {
    const parsedYarnFile = lockfile.parse(this.content);
    if (parsedYarnFile.type !== "success") {
      throw new Error("解析yarn.lock文件失败");
    }

    const graph: IGraphProps[] = [];
    const nodeSet = new Set<string>();
    const nodeMap = new Map<string, number>();
    const packagesArray = Object.entries(parsedYarnFile.object) as [
      string,
      IYarnFileEntry
    ][];
    for (const [key, value] of packagesArray) {
      const { name } = parseFromSpecify(key);
      nodeSet.add(name);

      if (value.dependencies) {
        const arr = Object.entries(value.dependencies);
        for (const [depName] of arr) {
          nodeMap.set(name, arr.length + 1);
          graph.push({
            source: name,
            target: depName,
          });
          nodeSet.add(depName);
        }
      }
    }

    const nodeArray: INodeArrayProps[] = Array.from(nodeSet).map((id) => ({
      id,
      label: id,
      symbolSize: nodeMap.get(id) || 1,
    }));

    return {
      graph,
      nodeArray,
    };
  }
}
