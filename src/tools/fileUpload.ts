import sparkMd5 from 'spark-md5';
import { IChunkFile } from '../interface/interface';

export const createFileChunk = (file: File, chunkSize: number) => {
  let current = 0;
  const fileSize = file.size;
  const chunkList: IChunkFile[] = [];
  while (current < fileSize) {
    const fileChunk = file.slice(current, current + chunkSize);
    chunkList.push({
      name: file.name,
      fileChunk: fileChunk,
      hash: '',
      progress: 0,
    });
    current += chunkSize;
  }
  return chunkList;
};

export const calculateFilesHash = (chunkList: any) => {
  return new Promise((resolve) => {
    const spark = new sparkMd5.ArrayBuffer();
    let count = 0;
    const loadNext = (index: number) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(chunkList[index].fileChunk);
      reader.onload = (e: any) => {
        count++;
        spark.append(e.target.result);
        // 如果文件处理完成则发送发送请求
        if (count === chunkList.length) {
          resolve(spark.end());
          return;
        }
        loadNext(count);
      };
    };
    loadNext(0);
  });
};

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} Bytes`;
  } else if (bytes < 1024 * 1024) {
    const kb = (bytes / 1024).toFixed(2);
    return `${kb} KB`;
  } else if (bytes < 1024 * 1024 * 1024) {
    const mb = (bytes / (1024 * 1024)).toFixed(2);
    return `${mb} MB`;
  } else if (bytes < 1024 * 1024 * 1024 * 1024) {
    const gb = (bytes / (1024 * 1024 * 1024)).toFixed(2);
    return `${gb} GB`;
  } else {
    const tb = (bytes / (1024 * 1024 * 1024 * 1024)).toFixed(2);
    return `${tb} TB`;
  }
};
