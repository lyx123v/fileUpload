export interface Response<T> {
  type:
    | "fileCheck"
    | "delete"
    | "chunkIndex"
    | "chunk"
    | "mergeFile"
    | "findChunk";
  data: T;
}

export interface ParamsResponse<T> {
  code: number;
  data: T;
}

export type mergeFileControllerParams = Response<{
  hash: string;
  name: string;
}>;

export type chunkIndexControllerParams = Response<{
  hash: string;
  ind: number;
}>;

export type findFileControllerParamsResponse = ParamsResponse<{
  type: "fileCheck";
  exists: boolean;
}>;

export type uploadFileChuckControllerParams = {
  chunk: Blob;
};

export type saveChunkControllerParamsResponse = ParamsResponse<{
  type: "mergeFile";
  index: number;
  hash: string;
}>;
