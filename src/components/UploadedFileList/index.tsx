import React, { useEffect, useState } from 'react';
import {
  IUploadedFile,
  IWaitCalculateFile,
  IWaitUploadedFile,
} from '../../interface/interface';
import CopyButton from '../CopyButton';

// @ts-ignore
import closeSvg from '../../assets/svg/close.svg';

// @ts-ignore
import downloadSvg from '../../assets/svg/download.svg';

// @ts-ignore
import pauseSvg from '../../assets/svg/pause.svg';

import { formatFileSize } from '../../tools/fileUpload';

import './index.less';

interface IProps {
  waitCalculateFiles: IWaitCalculateFile[];
  waitUploadedFiles: IWaitUploadedFile[];
  uploadFileList: IUploadedFile[];
  pauseUploaded?: (hash: string) => void;
  goOnUploaded?: (hash: string) => void;
  cancelUploaded?: (hash: string) => void;
}

const UploadedFileList: React.FC<IProps> = ({
  waitCalculateFiles = [],
  waitUploadedFiles = [],
  uploadFileList = [],
  pauseUploaded,
  goOnUploaded,
  cancelUploaded,
}) => {
  const [list, setList] = useState<IWaitUploadedFile[]>([]);

  useEffect(() => {
    const arr: IWaitUploadedFile[] = [];
    if (waitCalculateFiles.length) {
      waitCalculateFiles.forEach((item) => {
        arr.push({
          id: item.id,
          file: item.file,
          status: 0,
          chunkList: [],
          hash: '',
          progress: 0,
          progressArr: [],
          requestList: [],
        });
      });
    }
    if (waitUploadedFiles.length) {
      waitUploadedFiles.forEach((item) => {
        arr.push({
          id: item.id,
          file: item.file,
          status: item.status,
          chunkList: [],
          hash: item.hash,
          progress: item.progress,
          progressArr: [],
          requestList: [],
        });
      });
    }
    setList(arr);
  }, [waitCalculateFiles, waitUploadedFiles]);

  const uploadedList = list.length ? (
    <div className='list-wrapper'>
      <div className='dividing-line'></div>
      <div className='list-header'>正在上传...</div>
      <div className='uploaded-list'>
        {list.map((item: IWaitUploadedFile) => {
          const progress = `${(item.progress * 100).toFixed(0)}%`;
          return (
            <div className='uploaded-list-item' key={item.id}>
              <div className='img-unknown'>
                <span className='img-unknown-content'>?</span>
              </div>
              <div className='uploaded-list-item-info'>
                <div className='uploaded-list-item-info-name'>
                  {item.file.name}
                </div>
                <div className='uploaded-list-item-info-size'>
                  {formatFileSize(item.file.size)} {'      '}
                  {item.status === 1
                    ? '上传中'
                    : item.status === 2
                    ? '暂停中'
                    : '正在计算文件hash'}
                </div>
                <div className='progress-container'>
                  <div
                    className='progress-bar'
                    style={{ width: progress }}
                  ></div>
                </div>
              </div>
              <div className='uploaded-list-item-options'>
                {item.status === 1 ? (
                  <img
                    src={pauseSvg}
                    alt=''
                    onClick={() => {
                      pauseUploaded?.(item.hash);
                    }}
                  />
                ) : item.status === 2 ? (
                  <img
                    src={downloadSvg}
                    alt=''
                    onClick={() => {
                      goOnUploaded?.(item.hash);
                    }}
                  />
                ) : null}
                {item.status !== 0 && (
                  <img
                    src={closeSvg}
                    alt=''
                    onClick={() => {
                      cancelUploaded?.(item.hash);
                    }}
                  />
                )}
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
                  const divDom = document.createElement('div');
                  divDom.title = '图片加载失败或文件类型暂不支持预览';
                  divDom.className = 'img-unknown';
                  const spanDom = document.createElement('span');
                  spanDom.className = 'img-unknown-content';
                  spanDom.textContent = '?';
                  divDom.appendChild(spanDom);
                  parent?.insertBefore(divDom, parent.firstChild);
                }}
              />
              <div className='uploaded-list-item-info'>
                <div className='uploaded-list-item-info-name'>
                  {item.fileName}
                </div>
                <div className='uploaded-list-item-info-size'>
                  {item.size} {'     '} 上传成功
                </div>
              </div>
              <div className='uploaded-list-item-options'>
                <CopyButton text={item.url} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  ) : null;

  return (
    <div className='uploaded-wrapper'>
      {uploadedList}
      {previewList}
    </div>
  );
};

export default UploadedFileList;
