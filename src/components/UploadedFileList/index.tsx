import React, { useEffect } from 'react';
import { IUploadedFile, IWaitUploadedFile } from '../../interface/interface';
import CopyButton from '../CopyButton';

import './index.less';

interface IProps {
  waitUploadedFiles: IWaitUploadedFile[];
  uploadFileList: IUploadedFile[];
}

const UploadedFileList: React.FC<IProps> = ({
  waitUploadedFiles,
  uploadFileList,
}) => {
  const list = waitUploadedFiles.map((item: IWaitUploadedFile) => {
    return (
      <div key={item.id}>
        <div>{item.file.name}</div>
        <div className='progress-container'>
          <div
            className='progress-bar'
            style={{ width: `${item.progress * 100}%` }}
          ></div>
        </div>
      </div>
    );
  });

  const previewList = uploadFileList.map((item: IUploadedFile) => {
    return (
      <div key={item.url} className='uploaded-list-item'>
        <img
          src={item.url}
          alt=''
          className='uploaded-list-item-img'
          onClick={() => {
            window.open(item.url, '_blank');
          }}
        />
        <span className='uploaded-list-item-name'>{item.fileName}</span>
        <CopyButton text={item.url} className='uploaded-list-item-url' />
      </div>
    );
  });
  return (
    <div className='uploaded-container'>
      <div className='uploaded-title'>已上传文件</div>
      {list}
      <div className='uploaded-list'>{previewList}</div>
    </div>
  );
};

export default UploadedFileList;
