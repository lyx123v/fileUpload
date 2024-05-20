import { IGraphData } from "../types";

export abstract class baseDepGraph {
  // 解析lock文件
  abstract parse(): Promise<IGraphData>;
}
