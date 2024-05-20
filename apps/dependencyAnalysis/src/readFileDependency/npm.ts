import {
  IGraphData,
  IGraphProps,
  ILockFileOptions,
  INodeArrayProps,
} from "../types";
import { baseDepGraph } from "./base";

interface IPackageLock {
  packages: {
    // 根目录
    [path: string]: {
      version: string; // 版本
      dependencies?: {
        // 依赖包
        // packageName: 内部依赖
        [packageName: string]: string;
      };
      dev?: boolean; // 是否是开发依赖
      peerDependencies?: boolean; // 限制版本
      name?: string; // 包名
    };
  };
}

// npm包依赖
export class NpmLockGraph extends baseDepGraph {
  // 依赖包内容
  private content: any; // 包内容

  constructor(options: ILockFileOptions) {
    super();
    const { content } = options;
    this.content = content;
  }

  async parse(): Promise<IGraphData> {
    const parsedLock = JSON.parse(this.content) as IPackageLock;
    const { packages } = parsedLock;

    // 初始化graph和nodeArray
    const graph: IGraphProps[] = [];
    const nodeArray: INodeArrayProps[] = [];

    //          包名      包信息
    for (const [pkgPath, pkgDetails] of Object.entries(packages)) {
      if (!pkgPath) continue;

      // "node_modules/@babel/code-frame" -> "@babel/code-frame"
      const pkgName = pkgPath.replace(/^node_modules\//, "");

      const arr = Object.entries(pkgDetails?.dependencies || {});

      // 添加节点
      nodeArray.push({
        id: pkgName,
        label: pkgName,
        symbolSize: arr.length + 1,
      });

      // 存在依赖
      if (pkgDetails.dependencies) {
        // 解析依赖
        for (const [depName] of arr) {
          graph.push({
            source: pkgName, // 父节点
            target: depName, // 子节点
          });
        }
      }
    }

    return {
      graph,
      nodeArray,
    };
  }
}
