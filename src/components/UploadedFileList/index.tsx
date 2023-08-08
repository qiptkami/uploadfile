import React, { useEffect, useState } from 'react';
import {
  IUploadedFile,
  IWaitCalculateFile,
  IWaitUploadedFile,
} from '../../interface/interface';
import CopyButton from '../CopyButton';

// @ts-ignore
import loadingGIF from '../../assets//gif/loading.gif';

// @ts-ignore
import closeSvg from '../../assets/svg/close.svg';

// @ts-ignore
import downloadSvg from '../../assets/svg/download.svg';

// @ts-ignore
import pauseSvg from '../../assets/svg/pause.svg';

import './index.less';

interface IProps {
  waitCalculateFiles: IWaitCalculateFile[];
  waitUploadedFiles: IWaitUploadedFile[];
  uploadFileList: IUploadedFile[];
  pauseUploaded?: (hash: string) => void;
  goOnUploaded?: (hash: string) => void;
}

const UploadedFileList: React.FC<IProps> = ({
  waitCalculateFiles = [],
  waitUploadedFiles = [],
  uploadFileList = [],
  pauseUploaded,
  goOnUploaded,
}) => {
  useEffect(() => {
    console.log(waitCalculateFiles);
    const arr = [];
    waitCalculateFiles.forEach((item) => {
      arr.push({ name: item.file.name });
    });
    console.log('waitUploadedFiles:', waitUploadedFiles);
    console.log(uploadFileList);
  }, [waitCalculateFiles, waitUploadedFiles, uploadFileList]);

  const [list, setList] = useState();

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
      <div className='uploaded-list'>
        {waitUploadedFiles.map((item: IWaitUploadedFile) => {
          const progress = `${(item.progress * 100).toFixed(0)}%`;
          return (
            <div className='uploaded-list-item'>
              <div className='img-unknown'>
                <span className='img-unknown-content'>?</span>
              </div>
              <div className='uploaded-list-item-info'>
                <div className='uploaded-list-item-info-name'>
                  {item.file.name}
                </div>
                <div className='uploaded-list-item-info-size'>
                  {item.file.size} {'      '}
                  {item.status === 1 ? '上传中' : '暂停中'}
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
                ) : (
                  <img
                    src={downloadSvg}
                    alt=''
                    onClick={() => {
                      goOnUploaded?.(item.hash);
                    }}
                  />
                )}
                <img src={closeSvg} alt='' />
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
              <div className='uploaded-list-item-info'>
                <div className='uploaded-list-item-info-name'>
                  {item.fileName}
                </div>
                <div className='uploaded-list-item-info-size'>
                  {/* {item} */}
                  200kb {'     '} 上传成功
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
      {waitCalculateList}
      {uploadedList}
      {previewList}
    </div>
  );
};

export default UploadedFileList;
