import { readWantedLockfile } from "@pnpm/lockfile-file";
import {
  IGraphData,
  IGraphProps,
  ILockFileOptions,
  INodeArrayProps,
} from "../types";
import { baseDepGraph } from "./base";

// 根据依赖的格式解析出依赖信息
const parseFromSpecify = (specifier: string) => {
  const REGEXP = /^\/(@?[\w\-\d\\.]+(\/[\w\-\d\\.]+)?)\/(([\d\w\\.\\-]+)(.+)?)/;
  const match = specifier.match(REGEXP);
  // 匹配依赖的格式通过
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

export class PnpmLockGraph extends baseDepGraph {
  private lockPath: string;

  constructor(options: ILockFileOptions) {
    super();
    const { lockPath } = options;
    this.lockPath = lockPath;
  }

  async parse(): Promise<IGraphData> {
    const {
      importers, // 包依赖
      packages, // 包信息
    } =
      (await readWantedLockfile(
        this.lockPath.slice(0, -"pnpm-lock.yaml".length),
        {
          ignoreIncompatible: true,
        }
      )) || {};

    // 初始化graph和nodeArray
    const graph: IGraphProps[] = [];
    const nodeArray: INodeArrayProps[] = [];

    const nodeSet = new Set<string>();
    const nodeMap = new Map<string, number>();

    if (importers) {
      const importersArr = Object.entries(importers);
      for (const [
        importerName, // 项目名
        {
          dependencies, // 依赖
          devDependencies, // 开发依赖
        },
      ] of importersArr) {
        nodeSet.add(importerName); // 添加项目名到nodeArray
        const arr = Object.entries({
          ...dependencies,
          ...devDependencies,
        });
        nodeMap.set(importerName, arr.length + 1);
        for (const [depName] of arr) {
          graph.push({
            source: importerName, // 子节点
            target: depName, // 父节点
          });
          nodeSet.add(depName);
        }
      }
    }

    if (packages) {
      for (const [specifier, packageInfo] of Object.entries(packages)) {
        const { name } = parseFromSpecify(specifier);
        nodeSet.add(name);
        const arr = Object.entries({
          ...packageInfo.dependencies,
          ...packageInfo.peerDependencies,
        });
        for (const [depName] of arr) {
          graph.push({
            source: name,
            target: depName,
          });
          nodeSet.add(name);
        }
      }
    }

    nodeArray.push(
      ...Array.from(nodeSet).map((id) => ({
        id,
        label: id,
        symbolSize: nodeMap.get(id) || 1,
      }))
    );

    return {
      graph,
      nodeArray,
    };
  }
}
