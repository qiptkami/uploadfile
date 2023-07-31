import React from 'react';
import {
  IUploadedFile,
  IWaitCalculateFile,
  IWaitUploadedFile,
} from '../../interface/interface';
import CopyButton from '../CopyButton';

// @ts-ignore
import loadingGIF from '../../loading.gif';

import './index.less';

interface IProps {
  waitCalculateFiles: IWaitCalculateFile[];
  waitUploadedFiles: IWaitUploadedFile[];
  uploadFileList: IUploadedFile[];
}

const UploadedFileList: React.FC<IProps> = ({
  waitCalculateFiles = [],
  waitUploadedFiles = [],
  uploadFileList = [],
}) => {
  const waitCalculateList = waitCalculateFiles.length ? (
    <div className='list-wrapper'>
      <div className='dividing-line'></div>
      <div className='list-header'>正在计算文件hash...</div>
      <img className='loading' src={loadingGIF} alt='' />
      <>
        {waitCalculateFiles.map((item: IWaitCalculateFile) => {
          return <div key={item.id}>{item.file.name}</div>;
        })}
      </>
    </div>
  ) : null;

  const uploadedList = waitUploadedFiles.length ? (
    <div className='list-wrapper'>
      <div className='dividing-line'></div>
      <div className='list-header'>正在上传...</div>
      <div className='waited-list'>
        {waitUploadedFiles.map((item: IWaitUploadedFile) => {
          return (
            <div key={item.id} className='waited-list-item'>
              <span className='waited-list-item-name'>{item.file.name}</span>
              <div className='progress-container'>
                <div
                  className='progress-bar'
                  style={{ width: `${(item.progress * 100).toFixed(0)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  ) : null;

  const previewList = uploadFileList.length ? (
    <div className='list-wrapper'>
      <div className='dividing-line'></div>
      <div className='list-header'>已上传文件</div>
      <div className='uploaded-list'>
        {uploadFileList.map((item: IUploadedFile) => {
          return (
            <div key={item.url} className='uploaded-list-item'>
              <img
                id={item.url}
                src={item.url}
                alt=''
                className='uploaded-list-item-img'
                onClick={() => {
                  window.open(item.url, '_blank');
                }}
                onError={() => {
                  const imgDom = document.getElementById(item.url);
                  if (!imgDom) return;
                  const parent = imgDom.parentElement;
                  imgDom.remove();
                  const spanDom = document.createElement('span');
                  spanDom.textContent = '图片加载失败或文件类型暂不支持预览';
                  spanDom.className = 'uploaded-list-item-error';
                  parent?.insertBefore(spanDom, parent.firstChild);
                }}
              />
              <span className='uploaded-list-item-name'>{item.fileName}</span>
              <CopyButton text={item.url} className='uploaded-list-item-url' />
            </div>
          );
        })}
      </div>
    </div>
  ) : null;

  return (
    <div className='uploaded-wrapper'>
      {waitCalculateList}
      {uploadedList}
      {previewList}
    </div>
  );
};

export default UploadedFileList;
