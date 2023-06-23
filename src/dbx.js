const fs = require("fs");
const path = require("path");
const Dropbox = require("dropbox");
const extract = require("extract-zip");

const dropboxDownload = function (dropboxDirectory, localTarget, accessToken) {
  const dbx = new Dropbox.Dropbox({ accessToken });

  const destinationPath = path.resolve(`./${localTarget}`);
  dbx.filesDownloadZip({ path: dropboxDirectory }).then((response) => {
    const zipFolderPath = path.resolve(`./${response.result.metadata.name}`);
    const zipFilePath = zipFolderPath + ".zip";

    // write zip file to filesystem
    const buffer = Buffer.from(response.result.fileBinary, "binary");
    fs.writeFileSync(zipFilePath, buffer);

    // extract zip file
    extract(zipFilePath, { dir: __dirname })
      .then(() => {
        // create destination folder if not exists
        if (!fs.existsSync(destinationPath)) {
          fs.mkdirSync(destinationPath, { recursive: true });
        }

        // copy each exatracted file to destination
        fs.readdirSync(zipFolderPath).forEach((file) => {
          const slug = file.replace(/\s+/g, "-").toLowerCase();
          fs.copyFileSync(
            `${zipFolderPath}/${file}`,
            `${destinationPath}/${slug}`
          );
        });
      })
      .finally(() => {
        // delete temporary folders
        fs.rmSync(zipFilePath);
        fs.rmSync(zipFolderPath, { recursive: true, force: true });
      });
  });
};

module.exports = dropboxDownload;
