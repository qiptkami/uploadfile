import React, { useEffect, useState } from 'react';
import { IUploadedFile } from '../../interface/interface';
import { getAllFilesRequest, deleteFileRequest } from '../../request';
import CopyButton from '../CopyButton';

// @ts-ignore
import closeSvg from '../../assets/svg/close.svg';
// @ts-ignore
import unknown from '../../assets/img/unknown.png';

import { getExtendName } from '../../tools/fileUpload';
import './index.less';

const FileHistory: React.FC = () => {
  const [confirm, setConfirm] = useState<boolean>(false);
  const [fileHistory, setFileHistory] = useState<IUploadedFile[]>([]);
  const [pass, setPass] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');

  const [btnVisible, setBtnVisible] = useState<boolean>(false);

  useEffect(() => {
    const qikami = () => {
      setBtnVisible(true);
    };
    window.qikami = qikami;
  }, []);

  const deleteFile = (url: string) => {
    deleteFileRequest({ url: url });
    getAll(password);
  };

  const getAll = (inputValue: string) => {
    getAllFilesRequest({ password: inputValue }).then((res: any) => {
      const data = JSON.parse(res.data);
      if (data.value) {
        setFileHistory(data.urlList);
        setPass(true);
      } else {
        setPassword('');
        alert('密码错误');
      }
    });
  };

  const fileHistoryList = fileHistory.length ? (
    <>
      <div className='dividing-line'></div>
      <div className='file-wrapper'>
        {fileHistory.map((item: IUploadedFile) => {
          const fileType = getExtendName(item.url);
          return (
            <div key={item.url} className='file-card'>
              <img
                id={item.url}
                src={item.url}
                alt=''
                className='file-card-img'
                onClick={() => {
                  window.open(item.url, '_blank');
                }}
                onError={() => {
                  const imgDom = document.getElementById(
                    item.url
                  ) as HTMLImageElement;
                  if (!imgDom) return;
                  const pDom = imgDom.parentElement;
                  pDom && pDom.classList.add('file-card-unknown');
                  imgDom.src = unknown;
                  imgDom.title = '图片加载失败或文件类型暂不支持预览';
                }}
              />
              <div className='file-card-info'>
                <span className='file-card-info-type'>{fileType}</span>
                <span className='file-card-info-size'>{item.size}</span>
                <div className='file-card-info-options'>
                  <img
                    src={closeSvg}
                    alt=''
                    onClick={() => {
                      deleteFile(item.url);
                    }}
                  />
                  <CopyButton className='' text={item.url} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  ) : null;

  return (
    <div className='uploaded-wrapper'>
      {btnVisible && (
        <button
          className='uploaded-all-btn'
          onClick={() => {
            pass ? getAll(password) : setConfirm(true);
          }}
        >
          所有文件
        </button>
      )}
      {confirm && (
        <div className='confirm-wrapper'>
          <div className='confirm-text'>请输入密码</div>
          <div
            className='confirm-close'
            onClick={() => {
              setConfirm(false);
              setPassword('');
            }}
          >
            x
          </div>
          <div className='input-wrapper'>
            <input
              id='inputId'
              type='password'
              autoComplete='new-password'
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value);
              }}
            />
          </div>
          <button
            onClick={() => {
              getAll(password);
              setConfirm(false);
            }}
          >
            确认
          </button>
        </div>
      )}
      {fileHistoryList}
    </div>
  );
};

export default FileHistory;
