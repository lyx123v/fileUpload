
  // 文件目录要有讲究，源码应该放进 src 之类的目录，不要直接堆在根目录下。。。
// 检查给定的值是否为非空字符串。
export const isValidString = (filename: string) => {
  return typeof filename === 'string' && filename.length > 0;
};

// 检查传入值是否为非负整数
export const isPositiveInter = s =>
  typeof s === 'number' && s >= 0 && s % 1 === 0;

// 检查传入值是undefined
export const isUndefined = s => typeof s === 'undefined';