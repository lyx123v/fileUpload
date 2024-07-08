import JSZip from "jszip";

var zip = new JSZip();
/**
 * 生成ZIP文件
 * 注意：
 * @file 为当前操作的文件，也可新建
 * @compressionLevel 配置压缩等级, 默认为5
 */
const buildZip = async function (file, compressionLevel = 5) {
  /**
   * zip.file(params1);
   * 注意：
   * @params1 为当前操作的文件，也可新建
   */
  /**
   *  zip.generateAsync()
   *  compression ：选择是否压缩
   *              STORE 不压缩（默认）
   *              DEFLATE：压缩
   * compressionOptions：配置压缩等级 1-9 由低到高
   */
  return await zip
    .file(file.name, file)
    .generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: {
        level: compressionLevel,
      },
    })
    .then(function (content) {
      return content;
    });
};

/**
 * 解压ZIP文件
 * @file 为当前操作的文件，也可新建
 * @download 是否下载
 */
const decompressionZIP = async function (file, download = false) {
  await zip.loadAsync(file);
  return zip.generateAsync({ type: "blob" }).then(function (data) {
    if (download) {
      var tmp = document.createElement("a");
      tmp.download = "download.zip";
      tmp.style.display = "none";
      tmp.href = URL.createObjectURL(data);
      document.body.appendChild(tmp);
      tmp.click();
      document.body.removeChild(tmp);
    }
    return data;
  });
};
export { buildZip, decompressionZIP };
