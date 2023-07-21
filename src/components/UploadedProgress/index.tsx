import React, { useEffect } from 'react';
import { IWaitUploadedFile } from '../../interface/interface';

import './index.less';

const UploadedProgress: React.FC<{
  waitUploadedFiles: IWaitUploadedFile[];
}> = ({ waitUploadedFiles }) => {
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
  return <>{list}</>;
};

export default UploadedProgress;
