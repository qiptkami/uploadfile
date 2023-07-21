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
}

export interface IUploadedFile {
  fileName: string;
  url: string;
}
