const fs = require("fs");
const path = require("path");
const Dropbox = require("dropbox");
const extract = require("extract-zip");

/**
 * Downloads a folder from Dropbox and extracts it to a local directory.
 * @param {string} dropboxDirectory - The path to the folder in Dropbox.
 * @param {string} localTarget - The path to the local directory.
 * @param {string} accessToken - The Dropbox access token.
 * @returns {Promise<void>}
 */
const dropboxDownload = async function (dropboxDirectory, localTarget, accessToken) {
  const dbx = new Dropbox.Dropbox({ accessToken });

  const destPath = path.resolve(`${localTarget}`);

  const response = await dbx.filesDownloadZip({ path: dropboxDirectory });
  const zipFolderPath = path.join(destPath, `${response.result.metadata.name}`);
  const zipFilePath = zipFolderPath + ".zip";

  // create destination folder if doesn't exist
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath, { recursive: true });
  }

  // write zip file to filesystem
  const buffer = Buffer.from(response.result.fileBinary, "binary");
  fs.writeFileSync(zipFilePath, buffer);

  // extract zip file
  await extract(zipFilePath, { dir: destPath });

  // copy each exatracted file to destination
  fs.readdirSync(zipFolderPath).forEach((file) => {
    const slug = file.replace(/\s+/g, "-").toLowerCase();
    fs.copyFileSync(`${zipFolderPath}/${file}`, `${destPath}/${slug}`);
  });

  // delete temporary folders
  fs.rmSync(zipFilePath);
  fs.rmSync(zipFolderPath, { recursive: true, force: true });
};

module.exports = dropboxDownload;
