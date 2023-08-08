import React, { useEffect, useState } from 'react';
import {
  IWaitCalculateFile,
  IWaitUploadedFile,
  IUploadedFile,
} from '../../interface/interface';
import UpLoadFileClass from '../../uploadFile';
import InputFile from '../InputFile';
import UploadedFileList from '../UploadedFileList';

import './index.less';

const UploadFile: React.FC = () => {
  //如果只用一个数组，设置文件的状态来维护，如果文件多就不行，所以还是三个数组，完成就filter，最后的uploadedFiles不参与计算 只渲染
  const [waitCalculateFiles, setWaitCalculateFiles] = useState<
    IWaitCalculateFile[]
  >([]);
  const [waitUploadedFiles, setWaitUploadedFiles] = useState<
    IWaitUploadedFile[]
  >([]);
  const [uploadedFiles, setUploadedFiles] = useState<IUploadedFile[]>([]);
  const [uploadClass, setUploadClass] = useState<UpLoadFileClass>();

  useEffect(() => {
    setUploadClass(
      new UpLoadFileClass({
        chunkSize: 2 * 1024 * 1024,
        concurrency: 4,
        updateWaitCalculateFile: setWaitCalculateFiles,
        updateWaitUploadFile: setWaitUploadedFiles,
        updateUploadedFiles: setUploadedFiles,
      })
    );
  }, []);

  const handleInputFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || !uploadClass) return;
    uploadClass.addNewFiles(fileList);
  };

  return (
    <div className='container'>
      <InputFile handleInputFileChange={handleInputFileChange} />
      <UploadedFileList
        waitCalculateFiles={waitCalculateFiles}
        waitUploadedFiles={waitUploadedFiles}
        uploadFileList={uploadedFiles}
        pauseUploaded={uploadClass?.pauseUploaded}
        goOnUploaded={uploadClass?.goOnUploaded}
        cancelUploaded={uploadClass?.cancelUploaded}
      />
    </div>
  );
};

export default UploadFile;
