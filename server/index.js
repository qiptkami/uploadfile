const formidable = require('formidable');
const fs = require('fs');

const password = require('./config');
const express = require('express');
const app = express();

const {
  mergeFileChunks,
  randomString,
  getFileSize,
  getExtendName,
  getAllFile,
} = require('./tools');

const port = 8001;
const ipAddress = '124.70.53.215';
const hostIP = 'localhost';
const apiPrefix = 'api';

const filesPrefix = `http://${ipAddress}/files`;

app.use('*', function (req, res, next) {
  console.log('req: ', req);
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

app.post(`/${apiPrefix}/upload`, (req, res) => {
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

app.post(`/${apiPrefix}/verify`, (req, res) => {
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
          size: getFileSize(fs, filepath),
          url: `${filesPrefix}/${chunk.hash}.${extend}`,
        })
      );
    } else {
      const existChunkList = await getAllFile(fs, hashPath);
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

app.post(`/${apiPrefix}/merge`, (req, res) => {
  let body = '';
  req.on('data', (data) => {
    body += data;
  });
  req.on('end', async () => {
    const chunk = JSON.parse(body);
    await mergeFileChunks(fs, chunk);
    res.end(
      JSON.stringify({
        ok: 1,
        size: getFileSize(fs, `${__dirname}/files/${chunk.newFileName}`),
        url: `${filesPrefix}/${chunk.newFileName}`,
      })
    );
  });
});

app.post(`/${apiPrefix}/cancel`, (req, res) => {
  let body = '';
  req.on('data', (data) => {
    body += data;
  });
  req.on('end', async () => {
    const chunk = JSON.parse(body);
    const chunksDir = __dirname + `/uploads/${chunk.hash}`;
    fs.rmdir(chunksDir, { recursive: true }, (chunk) => {
      console.log(chunksDir);
    });
    res.end(JSON.stringify({ ok: 1 }));
  });
});

app.post(`/${apiPrefix}/all`, (req, res) => {
  let body = '';
  req.on('data', (data) => {
    body += data;
  });
  req.on('end', async () => {
    const chunk = JSON.parse(body);
    if (chunk.password === password) {
      const chunksDir = __dirname + `/files`;
      const files = await getAllFile(fs, chunksDir);
      console.log('files: ', files);
      const urlList = files.map((file) => {
        return {
          size: getFileSize(fs, `${chunksDir}/${file}`),
          url: `${filesPrefix}/${file}`,
        };
      });
      res.end(JSON.stringify({ value: 1, urlList }));
    } else {
      res.end(JSON.stringify({ value: 0 }));
    }
  });
});

app.post(`/${apiPrefix}/delete`, (req, res) => {
  let body = '';
  req.on('data', (data) => {
    body += data;
  });
  req.on('end', async () => {
    const chunk = JSON.parse(body);
    const url = chunk.url.split('/');
    const fileName = url[url.length - 1];
    const filePath = `${__dirname}/files/${fileName}`;
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
      }
    });
    res.end(JSON.stringify({ value: 1 }));
  });
});

app.listen(port, hostIP, () => {
  console.log(`Server started on port ${port}`);
});
