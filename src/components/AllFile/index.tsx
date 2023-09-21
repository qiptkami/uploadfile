import React, { useEffect, useState } from 'react';
import { IUploadedFile } from '../../interface/interface';
import { getAllFilesRequest, deleteFileRequest } from '../../request';

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
          const titleInfo = `${fileType}   ${item.size}`;
          return (
            <div key={item.url} className='file-card' title={titleInfo}>
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
                  imgDom.src = unknown;
                }}
              />
              <img
                className='file-card-close'
                src={closeSvg}
                alt=''
                onClick={() => {
                  deleteFile(item.url);
                }}
              />
            </div>
          );
        })}
      </div>
    </>
  ) : null;

  return (
    <div className='uploaded-all'>
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
