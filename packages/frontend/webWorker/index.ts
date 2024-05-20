// 动态创建webWorker
// 缺陷：无法使用import导入的模块
export const createWorker = (workerCode) => {
  let code = `
  ${workerCode}
`;
  const blobWorker: Blob = new Blob([code], {
      type: "text/javascript",
    }),
    worker = new Worker(URL.createObjectURL(blobWorker));

  return worker;
};
