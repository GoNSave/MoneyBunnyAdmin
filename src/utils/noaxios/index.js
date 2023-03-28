const https = require("https");

export const getPhotoUrl = (file_id) => {
  return new Promise((resolve, reject) => {
    const photoUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN_GNSGPTBOT}/getFile?file_id=${file_id}`;

    https
      .get(photoUrl, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          const { file_path } = JSON.parse(data).result;
          const downloadUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_TOKEN_GNSGPTBOT}/${file_path}`;
          resolve(downloadUrl);
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
};

export const getPhotoData = (url) => {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        const chunks = [];

        res.on("data", (chunk) => {
          chunks.push(chunk);
        });

        res.on("end", () => {
          const buffer = Buffer.concat(chunks);
          resolve(buffer);
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
};
