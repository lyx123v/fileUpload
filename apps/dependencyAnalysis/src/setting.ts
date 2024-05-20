// 服务端口
export const PORT = 3001;

// 前端端口
export const CLIENT_PORT = 3002;

// 依赖分析项目配置
// export const CONFIG = {
//   circle: 4, // 圈数
//   isSort: true, // 是否排序
//   size: undefined, // 大小(依赖图的显示大小，无则默认取浏览器最小宽高)
//   colorArray: [], // 生成色彩的数组
// };

export const CONFIG = {
  circle: 8, // 圈数
  isSort: false, // 是否排序
  size: 2048, // 大小(依赖图的显示大小，无则默认取浏览器最小宽高)
  // 生成色彩的数组,
  colorArray: [
    "red",
    "yellow",
    "green",
    "blue",
    "purple",
    "pink",
    "orange",
    "brown",
  ],
};
