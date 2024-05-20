import { CHUNK_INDEX, MERGE_FILE } from "@project/upload-file/setting";
import { FilePieceArray } from "../utils/file";
import {
  chunkIndexControllerParams,
  mergeFileControllerParams,
} from "@project/upload-file/types";

interface sendType {
  ws: WebSocket;
  data: mergeFileControllerParams | chunkIndexControllerParams;
}

// 发送消息
const send = ({ ws, data }: sendType) => {
  console.log("send", data);
  ws.send(JSON.stringify(data));
};

// 通知服务端合并文件
export const mergeFile = async (ws: WebSocket, row: FilePieceArray) => {
  send({
    ws,
    data: {
      type: MERGE_FILE,
      data: {
        hash: row.hash,
        name: row.fileName,
      },
    },
  });
};

// 通知服务端上传文件块索引
export const chunkIndex = async (ws: WebSocket, row: FilePieceArray) => {
  send({
    ws,
    data: {
      type: CHUNK_INDEX,
      data: {
        hash: row.hash,
        ind: row.totalIndex,
      },
    },
  });
};

// 上传文件块
export const uploadFileChuck = async (ws: WebSocket, row: FilePieceArray) => {
  console.log("send", row);
  ws.send(row.pieces[row.totalIndex].chunk);
};
