import { IChunkFile, IWaitUploadedFile } from './interface/interface';

const baseUrl = 'http://127.0.0.1:8001';

export const uploadFileRequest = (
  file: IWaitUploadedFile,
  concurrency: number,
  uploadedProgress: (
    uploadFile: IWaitUploadedFile,
    chunkIndex: number,
    progress: number
  ) => void
) => {
  return new Promise((resolve, reject) => {
    const chunkList = file.chunkList;
    let len = chunkList.length;
    let counter = 0;
    const start = async () => {
      if (!len) {
        //所有切片都已经上传，但是没有进行合并
        resolve('1');
      }
      // counter 只能拿到第一个切片???
      const chunkItem: IChunkFile = chunkList.shift() as IChunkFile;
      if (chunkItem) {
        const formData = new FormData();
        formData.append('file', chunkItem.fileChunk);
        formData.append('name', chunkItem.name);
        formData.append('hash', chunkItem.hash);
        const xhr = new XMLHttpRequest();
        // 分片上传完后的回调
        xhr.onload = () => {
          // 上传完成
          if (counter === len - 1) {
            resolve('1');
          } else {
            counter++;
            start();
          }
        };

        if (xhr.upload) {
          xhr.upload.onprogress = function (event: ProgressEvent) {
            if (event.lengthComputable) {
              //每个分片的进度
              // const percentComplete = (event.loaded / event.total) * 100;
              uploadedProgress(file, counter, event.loaded);
            }
          };
        }

        xhr.open('post', `${baseUrl}/upload`, true);
        xhr.send(formData);
      }
    };

    while (concurrency > 0) {
      setTimeout(() => {
        start();
      }, Math.random() * 100);
      concurrency--;
    }
  });
};

export const mergeRequest = (data: {
  fileName: string;
  newFileName: string;
  fileSize: number;
  chunkSize: number;
}) => {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('post', `${baseUrl}/merge`);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if ((xhr.status >= 200 && xhr.status <= 300) || xhr.status === 304) {
          resolve({
            data: xhr.responseText,
          });
        }
      }
    };
    xhr.send(JSON.stringify(data));
  });
};

export const verifyRequest = (data: { fileName: string; hash: string }) => {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('post', `${baseUrl}/verify`);
    xhr.setRequestHeader('Content-Type', 'application/json');

    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if ((xhr.status >= 200 && xhr.status <= 300) || xhr.status === 304) {
          resolve({
            data: xhr.responseText,
          });
        }
      }
    };
    xhr.send(JSON.stringify(data));
  });
};