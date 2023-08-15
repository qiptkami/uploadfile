const compareFun = (value1, value2) => {
  let v1 = parseInt(value1.split('_')[value1.split('_').length - 1]);
  let v2 = parseInt(value2.split('_')[value2.split('_').length - 1]);
  return v1 - v2;
};
const pipeStream = (fs, item, writeStream) => {
  return new Promise((resolve) => {
    const readStream = fs.createReadStream(item);
    readStream.on('end', () => {
      fs.unlinkSync(item, (err) => console.log(err));
      resolve();
    });
    readStream.pipe(writeStream);
  });
};
const mergeFileChunks = async (fs, data) => {
  if (!fs.existsSync(`${__dirname}/files`)) {
    try {
      fs.mkdirSync(`${__dirname}/files`, { recursive: true });
      console.log('文件夹创建成功');
    } catch (err) {
      console.error('创建文件夹时出错:', err);
    }
  }
  const chunksDir = __dirname + `/uploads/${data.fileName}`;

  const files = fs.readdirSync(chunksDir);
  const chunkFilesPath = files.map((item) => `${chunksDir}/${item}`);
  chunkFilesPath.sort(compareFun);
  await Promise.all(
    /**
     * 异步的将每一个文件item写入创建的文件可写流里
     */
    chunkFilesPath.map((item, index) =>
      pipeStream(
        fs,
        item,
        fs.createWriteStream(`${__dirname}/files/${data.newFileName}`, {
          flag: 'a+',
          start: index * data.chunkSize,
          end:
            (index + 1) * data.chunkSize > data.fileSize
              ? data.fileSize
              : (index + 1) * data.chunkSize,
        })
      )
    )
  );
  fs.rmdir(chunksDir, { recursive: true }, (err) => {
    console.log(chunksDir);
    console.log(err);
  });
  // fs.readdir(chunksDir, async (err, files) => {
  //   if (err) {
  //     console.log(err);
  //     return;
  //   }
  //   const chunkFilesPath = files.map((item) => `${chunksDir}/${item}`);
  //   chunkFilesPath.sort(compareFun);
  //   await Promise.all(
  //     /**
  //      * 异步的将每一个文件item写入创建的文件可写流里
  //      */
  //     chunkFilesPath.map((item, index) =>
  //       pipeStream(
  //         fs,
  //         item,
  //         fs.createWriteStream(`${__dirname}/files/${data.newFileName}`, {
  //           flag: 'a+',
  //           start: index * data.chunkSize,
  //           end:
  //             (index + 1) * data.chunkSize > data.fileSize
  //               ? data.fileSize
  //               : (index + 1) * data.chunkSize,
  //         })
  //       )
  //     )
  //   );
  //   fs.rmdir(chunksDir, { recursive: true }, (err) => {
  //     console.log(chunksDir);
  //     console.log(err);
  //   });
  // });
};
const randomString = (length) => {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charactersLength);
    result += characters.charAt(randomIndex);
  }
  return result;
};

const getFileSize = (fs, filePath) => {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats.size;
  const formatFileSize = (bytes) => {
    if (bytes < 1024) {
      return `${bytes} Bytes`;
    } else if (bytes < 1024 * 1024) {
      const kb = (bytes / 1024).toFixed(2);
      return `${kb} KB`;
    } else if (bytes < 1024 * 1024 * 1024) {
      const mb = (bytes / (1024 * 1024)).toFixed(2);
      return `${mb} MB`;
    } else if (bytes < 1024 * 1024 * 1024 * 1024) {
      const gb = (bytes / (1024 * 1024 * 1024)).toFixed(2);
      return `${gb} GB`;
    } else {
      const tb = (bytes / (1024 * 1024 * 1024 * 1024)).toFixed(2);
      return `${tb} TB`;
    }
  };

  return formatFileSize(fileSizeInBytes);
};

const getExtendName = (nameStr) => {
  return nameStr.split('.')[nameStr.split('.').length - 1];
};

const getAllFile = (fs, folderPath) => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(folderPath)) {
      const fileNames = fs.readdirSync(folderPath);
      resolve(fileNames);
    } else {
      resolve([]);
    }
  });
};

module.exports = {
  mergeFileChunks,
  randomString,
  getFileSize,
  getExtendName,
  getAllFile,
};
