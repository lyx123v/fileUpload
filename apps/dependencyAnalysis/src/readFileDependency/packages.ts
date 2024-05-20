import {
  IGraphData,
  IGraphProps,
  ILockFileOptions,
  INodeArrayProps,
} from "../types";

import { baseDepGraph } from "./base";

interface packages {
  version: string;
  dependencies?: { [packageName: string]: string };
  devDependencies?: { [packageName: string]: string };
  name?: string;
}

export class packagesGraph extends baseDepGraph {
  private content: string;

  constructor(options: ILockFileOptions) {
    super();
    const { content } = options;
    this.content = content;
  }

  async parse(): Promise<IGraphData> {
    const parsedLock = JSON.parse(this.content) as packages;
    // 初始化graph和nodeArray
    const graph: IGraphProps[] = [];
    const nodeArray: INodeArrayProps[] = [];

    const packageArr = Object.entries(parsedLock.dependencies || {}).concat(
      Object.entries(parsedLock.devDependencies || {})
    );

    for (const [pkgName, version] of packageArr) {
      nodeArray.push({
        id: pkgName,
        label: pkgName,
        symbolSize: 1,
      });

      if (version) {
        graph.push({
          source: pkgName,
          target: pkgName,
        });
      }
    }

    return {
      graph,
      nodeArray,
    };
  }
}
