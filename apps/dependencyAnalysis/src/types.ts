export interface Response<T> {
  code: number; // 状态码
  data: T; // 数据
  message?: string; // 提示信息
}

export interface IGraphProps {
  source: string; // 源节点
  target: string; // 目标节点
}

export interface INodeArrayProps {
  id: string; // 节点id
  typeCounter?: number; // 节点类型
  x?: number; // x坐标
  y?: number; // y坐标
  label?: string; // 节点名称
  symbolSize?: number; // 节点大小
}

export type GetGraphControllerResponse = Response<{
  // 图形数据
  graph: IGraphProps[];
  // 节点数据
  nodeArray: INodeArrayProps[];
}>;

export interface IGetGrapDataOptions {
  // 依赖包
  pkg: IDepOptions;
}

export interface IDepOptions {
  dependencies?: IDependencies;
  devDependencies?: IDependencies;
}

export interface IGraphData {
  graph: IGraphProps[];
  nodeArray: INodeArrayProps[];
}

export interface ICheckFileResult {
  // 检查结果
  status: boolean;
  // 子路径
  childPath?: string;
}

export type PackageName = string | undefined;

export interface IDependencies {
  [key: string]: string;
}

export interface IGraphData {
  graph: IGraphProps[];
  nodeArray: INodeArrayProps[];
}

export interface IBuildGraphOptions {
  // 依赖包路径
  pkgDir: string;
  // 依赖包名称
  source: PackageName;
  // 依赖包
  dependencies: IDependencies;
  // 节点类型
  typeCounter?: number;
}

export interface ILockFileOptions {
  // 依赖包
  name: string;
  // 依赖包内容
  content: any;
  // 依赖包路径
  lockPath: string;
}
