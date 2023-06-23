const fs = require("fs");
const path = require("path");
const Dropbox = require("dropbox");
const extract = require("extract-zip");

/**
 * Downloads a folder from Dropbox and extracts it to a local directory.
 * @param {string} dropboxDirectory - The path to the folder in Dropbox.
 * @param {string} localTarget - The path to the local directory.
 * @param {string} accessToken - The Dropbox access token.
 * @returns {void}
 */
const dropboxDownload = function (dropboxDirectory, localTarget, accessToken) {
  const dbx = new Dropbox.Dropbox({ accessToken });

  const destinationPath = path.resolve(`${localTarget}`);

  dbx.filesDownloadZip({ path: dropboxDirectory }).then((response) => {
    const zipFolderPath = path.join(
      destinationPath,
      `${response.result.metadata.name}`
    );
    const zipFilePath = zipFolderPath + ".zip";

    // create destination folder if doesn't exist
    if (!fs.existsSync(destinationPath)) {
      fs.mkdirSync(destinationPath, { recursive: true });
    }
    // write zip file to filesystem
    const buffer = Buffer.from(response.result.fileBinary, "binary");
    fs.writeFileSync(zipFilePath, buffer);

    // extract zip file
    extract(zipFilePath, { dir: destinationPath })
      .then(() => {
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
