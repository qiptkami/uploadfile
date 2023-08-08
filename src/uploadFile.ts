import {
  IWaitCalculateFile,
  IWaitUploadedFile,
  IUploadedFile,
  IChunkFile,
} from './interface/interface';
import { mergeRequest, uploadFileRequest, verifyRequest } from './request';
import { calculateFilesHash, createFileChunk } from './tools/fileUpload';

interface IProps {
  updateWaitCalculateFile: (files: Array<IWaitCalculateFile>) => void;
  updateWaitUploadFile: (files: Array<IWaitUploadedFile>) => void;
  updateUploadedFiles: (files: Array<IUploadedFile>) => void;
  chunkSize: number;
  concurrency: number;
}

export default class UpLoadFileClass {
  waitCalculateFiles = [] as Array<IWaitCalculateFile>;
  waitUploadFiles = [] as Array<IWaitUploadedFile>;
  uploadedFiles = [] as Array<IUploadedFile>;

  updateWaitCalculateFile: (files: Array<IWaitCalculateFile>) => void;
  updateWaitUploadFile: (files: Array<IWaitUploadedFile>) => void;
  updateUploadedFiles: (files: Array<IUploadedFile>) => void;

  chunkSize: number;
  concurrency: number;
  constructor(props: IProps) {
    this.updateWaitCalculateFile = props.updateWaitCalculateFile;
    this.updateWaitUploadFile = props.updateWaitUploadFile;
    this.updateUploadedFiles = props.updateUploadedFiles;

    this.chunkSize = props.chunkSize;
    this.concurrency = props.concurrency;
  }

  public addNewFiles = async (fileList: FileList) => {
    if (!fileList) return;

    const len = fileList.length;
    for (let i = 0; i < len; i++) {
      const file = fileList[i];
      this.waitCalculateFiles.push({
        id: `${file.name}_${new Date().getTime()}`,
        file: file,
      });
    }
    this.updateWaitCalculateFile([...this.waitCalculateFiles]);
    this.calculateFileHash();
  };

  public pauseUploaded = async (hash: string) => {
    const findFile = this.waitUploadFiles.find((item) => item.hash === hash);
    if (!findFile) return;
    findFile.status = 2;
    findFile.requestList.forEach((xhr: XMLHttpRequest) => {
      xhr.abort();
    });
    findFile.requestList = [];
    this.updateWaitUploadFile([...this.waitUploadFiles]);
  };

  public goOnUploaded = async (hash: string) => {
    const findFile = this.waitUploadFiles.find((item) => item.hash === hash);
    if (!findFile) return;
    findFile.status = 1;
    this.upload(findFile);
  };

  private calculateFileHash = async () => {
    while (this.waitCalculateFiles.length > 0) {
      const file = this.waitCalculateFiles[0].file;
      if (file) {
        const fileChunk = createFileChunk(file, this.chunkSize);
        let hash: string = (await calculateFilesHash(fileChunk)) as string;
        const uploadFile = {
          id:
            this.waitCalculateFiles[0].id ||
            `${file.name}_${new Date().getTime()}`,
          file: file,
          chunkList: fileChunk,
          hash: hash,
          progress: 0,
          progressArr: Array(fileChunk.length).fill(0),
          status: 1,
          requestList: [],
        };
        uploadFile.chunkList.forEach((item: IChunkFile, index: number) => {
          item.hash = `${hash}_${index}`;
          item.name = hash;
        });
        this.waitCalculateFiles.shift();
        this.waitUploadFiles.push(uploadFile);
        this.updateWaitCalculateFile([...this.waitCalculateFiles]);
        this.updateWaitUploadFile([...this.waitUploadFiles]);
        this.upload(uploadFile); // 上传文件
      }
    }
  };

  private getExtendName = (nameStr: string): string => {
    return nameStr.split('.')[nameStr.split('.').length - 1];
  };

  private upload = async (uploadFile: IWaitUploadedFile) => {
    //根据hash => 服务端有没有该文件的切片，如果有，则filter掉
    const response: any = await verifyRequest({
      fileName: uploadFile.file.name,
      hash: uploadFile.hash,
    });
    const data = JSON.parse(response.data);
    if (data.value) {
      uploadFile.progress = 1;
      this.completeUpload(uploadFile, data.url, uploadFile.file.size);
      return;
    } else {
      const existChunkList = data.existChunkList;
      uploadFile.chunkList = uploadFile.chunkList.filter((item: IChunkFile) => {
        return existChunkList.indexOf(item.hash) === -1;
      });
    }

    uploadFileRequest(
      uploadFile,
      this.concurrency,
      this.uploadedProgress,
      uploadFile.requestList
    ).then(async () => {
      const response: any = await mergeRequest({
        fileName: uploadFile.hash,
        newFileName: `${uploadFile.hash}.${this.getExtendName(
          uploadFile.file.name
        )}`,
        fileSize: uploadFile.file.size,
        chunkSize: this.chunkSize,
      });
      const imgInfo = JSON.parse(response.data);
      this.completeUpload(uploadFile, imgInfo.url, uploadFile.file.size);
    });
  };

  private completeUpload = (
    uploadFile: IWaitUploadedFile,
    url: string,
    size: number
  ) => {
    this.waitUploadFiles = this.waitUploadFiles.filter((item) => {
      return item.id !== uploadFile.id;
    });
    const find = this.uploadedFiles.find((item) => url === item.url);
    if (find) return;
    this.updateWaitUploadFile([...this.waitUploadFiles]);
    this.uploadedFiles.push({
      fileName: uploadFile.file.name,
      url: url,
      size: size,
    });
    this.updateUploadedFiles([...this.uploadedFiles]);
  };

  private uploadedProgress = (
    file: IWaitUploadedFile,
    index: number,
    progress: number
  ) => {
    //进度是 切片的总大小 / 文件大小
    const findFile = this.waitUploadFiles.find(
      (item) => item.id === file.id && item.hash === file.hash
    );
    if (!findFile) return;
    findFile.progressArr[index] = progress;
    const uploadedSize = findFile.progressArr.reduce((perv, cur) => perv + cur);
    file.progress = uploadedSize / findFile.file.size;
    this.updateWaitUploadFile([...this.waitUploadFiles]);
  };
}
