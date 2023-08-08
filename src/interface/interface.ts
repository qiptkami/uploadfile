export interface IWaitCalculateFile {
  id: string;
  file: File;
}

export interface IChunkFile {
  hash: string;
  name: string;
  fileChunk: Blob;
  progress: number;
}

export interface IWaitUploadedFile {
  id: string;
  file: File;
  chunkList: Array<IChunkFile>;
  hash: string;
  progress: number;
  progressArr: Array<number>;
  status: number; //下载中为1 暂停为2
  requestList: Array<XMLHttpRequest>; //暂停用
}

export interface IUploadedFile {
  fileName: string;
  url: string;
}
