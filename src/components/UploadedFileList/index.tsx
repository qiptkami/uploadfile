import React, { useEffect } from 'react';
import { IUploadedFile } from '../../interface/interface';
import CopyButton from '../CopyButton';

import './index.less';

interface IProps {
  uploadFileList: IUploadedFile[];
}

const UploadedFileList: React.FC<IProps> = ({ uploadFileList }) => {
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
        <progress value='50' max='100'></progress>
        <CopyButton text={item.url} className='uploaded-list-item-url' />
      </div>
    );
  });
  return (
    <div className='uploaded-container'>
      <div className='uploaded-title'>已上传文件</div>
      <div className='uploaded-list'>{previewList}</div>
    </div>
  );
};

export default UploadedFileList;
