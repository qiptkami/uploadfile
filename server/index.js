const formidable = require('formidable');
const fs = require('fs');

const express = require('express');
const app = express();

const port = 8001;
const hostIP = '127.0.0.1';

app.use('*', function (req, res, next) {
  res.setHeader('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.use(express.static(`${__dirname}/files`));

const compareFun = (value1, value2) => {
  let v1 = parseInt(value1.split('_')[value1.split('_').length - 1]);
  let v2 = parseInt(value2.split('_')[value2.split('_').length - 1]);
  return v1 - v2;
};
const pipeStream = (item, writeStream) => {
  return new Promise((resolve) => {
    const readStream = fs.createReadStream(item);
    readStream.on('end', () => {
      fs.unlinkSync(item, (err) => console.log(err));
      resolve();
    });
    readStream.pipe(writeStream);
  });
};
const mergeFileChunks = async (data) => {
  if (!fs.existsSync(`${__dirname}/files`)) {
    fs.mkdir(`${__dirname}/files`, { recursive: true }, (err) => {
      if (err) {
        console.error('创建文件夹时出错:', err);
      } else {
        console.log('文件夹创建成功');
      }
    });
  }
  const chunksDir = __dirname + `/uploads/${data.fileName}`;
  fs.readdir(chunksDir, async (err, files) => {
    if (err) {
      console.log(err);
      return;
    }
    const chunkFilesPath = files.map((item) => `${chunksDir}/${item}`);
    chunkFilesPath.sort(compareFun);
    Promise.all(
      /**
       * 异步的将每一个文件item写入创建的文件可写流里
       */
      chunkFilesPath.map((item, index) =>
        pipeStream(
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
    ).then(() => {
      fs.rmdir(chunksDir, { recursive: true }, (err) => {
        console.log(chunksDir);
        console.log(err);
      });
    });
  });
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

app.post('/upload', (req, res) => {
  if (!fs.existsSync(`${__dirname}/uploads`)) {
    fs.mkdir(`${__dirname}/uploads`, { recursive: true }, (err) => {
      if (err) {
        console.error('创建文件夹时出错:', err);
      } else {
        console.log('文件夹创建成功');
      }
    });
  }
  //创建实例
  let form = new formidable.IncomingForm({
    keepExtensions: true, //保持原来的文件的扩展名
    uploadDir: `${__dirname}/uploads`, //设置上传文件存放的目录
    filename: (name, ext, part, form) => {
      //fix windows invalid name
      return `${new Date().getTime()}_${randomString(5)}`;
    },
  });

  //解析表单（异步）
  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('解析 FormData 数据时出错:', err);
      res.statusCode = 500;
      res.end('Internal Server Error');
      return;
    }
    const fileName = fields.name[0];
    const fileHash = fields.hash[0];

    fs.mkdir(`${__dirname}/uploads/${fileName}`, { recursive: true }, (err) => {
      if (err) {
        console.log('创建文件夹出错:' + err);
      } else {
        console.log('files: ', files);
        let oldPath = files?.file?.[0].filepath;

        let newPath = `${__dirname}/uploads/${fileName}/${fileHash}`;
        fs.rename(oldPath, newPath, (err) => {
          if (err) {
            console.log(err);
          }
        });
      }
      res.end('ok');
    });
    res.statusCode = 200;
    res.end('ok');
  });
});

const getExtendName = (nameStr) => {
  return nameStr.split('.')[nameStr.split('.').length - 1];
};

const getAllFile = (folderPath) => {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(folderPath)) {
      const fileNames = fs.readdirSync(folderPath);
      resolve(fileNames);
    } else {
      resolve([]);
    }
  });
};

app.post('/verify', (req, res) => {
  //找files 下 是否存在该文件 如果存在 直接return 不存在 判断 uploads 下有多少个该文件的  切片
  let body = '';
  req.on('data', (data) => {
    body += data;
  });
  req.on('end', async () => {
    const chunk = JSON.parse(body);
    console.log('chunk: ', chunk);
    const extend = getExtendName(chunk.fileName);
    const filepath = `${__dirname}/files/${chunk.hash}.${extend}`;
    const hashPath = `${__dirname}/uploads/${chunk.hash}`;
    if (fs.existsSync(filepath)) {
      res.end(
        JSON.stringify({
          value: 1,
          url: `http://${hostIP}:${port}/${chunk.hash}.${extend}`,
        })
      );
    } else {
      const existChunkList = await getAllFile(hashPath);
      console.log('existChunkList: ', existChunkList);
      res.end(
        JSON.stringify({
          value: 0,
          existChunkList: existChunkList,
        })
      );
    }
  });
});

app.post('/merge', (req, res) => {
  let body = '';
  req.on('data', (data) => {
    body += data;
  });
  req.on('end', async () => {
    const chunk = JSON.parse(body);
    await mergeFileChunks(chunk);
    res.end(
      JSON.stringify({
        ok: 1,
        url: `http://${hostIP}:${port}/${chunk.newFileName}`,
      })
    );
  });
});

app.listen(port, hostIP, () => {
  console.log(`Server started on port ${port}`);
});
