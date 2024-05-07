<template>
  <div class="upload-container">
    <div class="wrap">
      <input type="file" hidden ref="file" @change="handleFileChange" multiple class="ipt" />
      <el-button type="primary" size="small" @click="() => file.click()">上传文件
      </el-button>
      <el-table :data="fileChunksArray" empty-text="无文件">
        <el-table-column prop="fileName" label="文件名"></el-table-column>
        <el-table-column label="文件大小">
          <template #default="{ row }">
            {{ row.fileSize }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'waiting'" type="info">等待上传</el-tag>
            <el-tag v-else-if="row.status === 'resolving'" type="warning">正在计算hash</el-tag>
            <el-tag v-else-if="row.status === 'uploading'" type="primary">上传中</el-tag>
            <el-tag v-else-if="row.status === 'success'" type="success">上传成功</el-tag>
            <el-tag v-else-if="row.status === 'error'" type="danger">上传失败</el-tag>
            <el-tag v-else-if="row.status === 'stop'" type="warning">暂停上传</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="percentage" label="上传进度">
          <template #default="{ row }">
            <el-progress :width="50" type="circle"
              :percentage="row.status === 'success' ? 100 : row.percentage.toFixed(2)" />
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <div class="btn">
              <el-button v-if="row.status == 'waiting'" type="primary" size="small"
                @click="uploadFile(row)">上传</el-button>
              <el-button v-if="row.status == 'uploading' || row.status == 'stop'" type="warning" size="small"
                @click="handlePause(row)">{{
        row.status == 'uploading' ? '暂停' : row.status == 'stop' ? '继续' : ''
                }}</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { calHash } from '../utils/hash';
import { indexDB } from '@packages/utils/src/frontend';
import { type FilePieceArray, splitFile } from '../utils/file';
import prettysize from 'prettysize';
import {
  DELETE,
  FIND_FILE,
  CHUNK_INDEX,
  MERGE_FILE
} from "@project/upload-file/src/setting";
const fileArray = ref<Array<File> | null>(null); // 文件
const fileChunksArray = ref<FilePieceArray[]>([]); // 文件切片
const ws = ref<WebSocket[]>([]); // WebSocket链接数组
const file = ref<HTMLInputElement>(); // 文件上传
// 加载数据
const loadData = async () => {
  const data: any = await indexDB.get('fileChunksArray');
  if (data) {
    fileChunksArray.value = data.content.map((item: any) => {
      connectWebSocket({
        hash: item.hash,
        name: item.fileName,
        index: item.index
      });
      return {
        ...item,
      };
    });
  }
};

// 获取文件
function handleFileChange(e: any) {
  fileArray.value = e.target.files; // 获取文件数组
  pretreatmentFile(); // 预处理文件
  setTimeout(() => {
    fileArray.value = null;
  }, 0);
}

// 预处理文件
async function pretreatmentFile() {
  // 文件为空直接弹出
  if (!fileArray.value) return;
  const len = fileArray.value.length;
  // 文件数组为空直接弹出
  if (!len) return;
  // 获取已切片的文件数组
  for (let i = 0; i < len; i++) {
    const fileData = fileArray.value![i];
    const pieces = splitFile(fileData)
    fileChunksArray.value.push({
      fileData, // 文件分块信息数组
      fileName: fileArray.value![i].name, // 文件名
      hash: '', // 文件hash
      percentage: 0, // 进度
      status: 'resolving', // 上传状态
      fileSize: fileSize(fileData),
      pieces,
      totalIndex: 0,
      index: 0
    });
    const piecesLen = fileChunksArray.value.length - 1;
    // piecesLen为当前文件的索引
    calHash({ chunks: pieces }).then(hash => {
      fileChunksArray.value[piecesLen].hash = hash;
      fileChunksArray.value[piecesLen].index = piecesLen;
      // 创建websocket
      connectWebSocket({
        hash,
        name: fileData.name,
        index: piecesLen
      });
      fileChunksArray.value[piecesLen].fileData = null; // 释放内存
    });
  }
}

// 文件上传
async function uploadFile(row: FilePieceArray) {
  const piecesLength = row.pieces.length;
  if (piecesLength == row.totalIndex) {
    // 更新视图
    row.status = 'success';
    row.percentage = 100;
    // 通知服务端合并文件
    ws.value[row.index].send(
      JSON.stringify({
        type: MERGE_FILE,
        data: {
          hash: row.hash,
          name: row.fileName,
        },
      })
    );
    row.pieces = []; // 释放内存
    return;
  } else {
    row.status = 'uploading';
    row.percentage = parseFloat(((row.totalIndex / piecesLength) * 100).toFixed(2));
    row.pieces[row.totalIndex].isUploaded = true; // 标记已上传
    // 通知服务端上传文件块索引
    ws.value[row.index].send(
      JSON.stringify({
        type: CHUNK_INDEX,
        data: {
          hash: row.hash,
          ind: row.totalIndex
        },
      })
    );
    // 上传文件块
    ws.value[row.index].send(row.pieces[row.totalIndex].chunk);
    row.totalIndex++;
  }
}

// 获取文件大小，格式化
const fileSize = (file: File): string => {
  return prettysize(file.size);
};

// 保存到IndexDB
const saveIndexDB = async () => {
  indexDB.add('fileChunksArray', fileChunksArray.value.map(item => {
    return {
      ...item,
      pieces: item.pieces.map((e: any) => {
        return {
          chunk: e.chunk,
          isUploaded: e.isUploaded,
        }
      })
    };
  }));
};

onMounted(async () => {
  // 加载indexDB数据
  await loadData();
})

// 暂停或继续上传
async function handlePause(row: FilePieceArray) {
  row.status = row.status === 'uploading' ? 'stop' : 'uploading'; // 暂停/继续变更状态
  if (row.status === 'uploading') {
    // 继续上传chuang
    await connectWebSocket({
      hash: row.hash,
      name: row.fileName,
      index: row.index
    }, true);
    uploadFile(row);
  } else if (row.status === 'stop') {
    // 暂停
    ws.value[row.index].close();
  }
  saveIndexDB();
}

// 增加websocket
const connectWebSocket = async ({
  hash,
  name,
  index
}, isAgain = false) => {
  await new Promise<void>((resolve, reject) => {
    const wsApi = new WebSocket(`ws://localhost:3000/websocket/${hash}_${name}`)
    wsApi.onmessage = (e) => {
      const data = JSON.parse(e.data).data;
      if (data.type === FIND_FILE) {
        // 查找文件
        if (data.exists) {
          fileChunksArray.value[index].status = 'success';
          fileChunksArray.value[index].percentage = 100;
        } else {
          fileChunksArray.value[index].status = isAgain ? 'resolving' : 'waiting';
        }
      } else if (data.type === MERGE_FILE) {
        // 合并文件成功
        const row: FilePieceArray = fileChunksArray.value.find(item => item.hash === data.hash)!;
        uploadFile(row)
      }
      saveIndexDB();
    };
    wsApi.onopen = () => {
      console.log('webSorcket连接成功');
      resolve();
    };
    wsApi.onclose = () => {
      console.log('webSorcket连接关闭');
      reject()
    };
    wsApi.onerror = () => {
      console.log('webSorcket连接失败');
      reject()
    };
    // 保存ws
    ws.value[index] = wsApi;
  })
};

</script>

<style lang="css">
.upload-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80vw;
  height: auto;
  border: 1px #666 solid;
}

.wrap {
  width: 80%;
  height: 80%;
}

.ipt {
  margin-bottom: 10px;
  width: 100%;
}

.btn {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 60px;
}
</style>
