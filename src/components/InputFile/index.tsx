import React from 'react';

import './index.less';

interface IProps {
  handleInputFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputFile: React.FC<IProps> = ({ handleInputFileChange }) => {
  return (
    <div className='input-file-container'>
      <input
        type='file'
        title=''
        multiple
        onChange={(e) => handleInputFileChange(e)}
      ></input>
    </div>
  );
};

export default InputFile;
