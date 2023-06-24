const fs = require("fs");
const path = require("path");
const Dropbox = require("dropbox");
const extract = require("extract-zip");
const axios = require("axios");

/**
 * Gets a Dropbox access token from a refresh token.
 * @param {string} refreshToken - The Dropbox refresh token.
 * @param {string} appKey - The Dropbox app key.
 * @param {string} appSecret - The Dropbox app secret.
 * @returns {Promise<string>}
 *
 * @see https://www.dropbox.com/developers/documentation/http/documentation#oauth2-token
 **/
const getAccessToken = async function (refreshToken, appKey, appSecret) {
  const response = await axios({
    method: "post",
    url: "https://api.dropboxapi.com/oauth2/token",
    headers: {
      Authorization: `Basic ${Buffer.from(`${appKey}:${appSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: `refresh_token=${refreshToken}&grant_type=refresh_token`,
  });

  return response.data.access_token;
};

/**
 * Downloads a folder from Dropbox and extracts it to a local directory.
 * @param {string} dropboxDirectory - The path to the folder in Dropbox.
 * @param {string} localTarget - The path to the local directory.
 * @param {string} refreshToken - The Dropbox refresh token.
 * @param {string} appKey - The Dropbox app key.
 * @param {string} appSecret - The Dropbox app secret.
 * @returns {Promise<void>}
 */
const dropboxDownload = async function (
  dropboxDirectory,
  localTarget,
  refreshToken,
  appKey,
  appSecret
) {
  const accessToken = await getAccessToken(refreshToken, appKey, appSecret);
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

module.exports = {
  dropboxDownload,
  getAccessToken,
};
