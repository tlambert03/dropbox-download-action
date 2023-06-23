const fs = require("fs");
const path = require("path");
const Dropbox = require("dropbox");
const extract = require("extract-zip");

let dropboxDownload = function (dropboxDirectory, localTarget, accessToken) {
  const dbx = new Dropbox.Dropbox({ accessToken });

  const workingDirectory = process.cwd();
  const destinationPath = path.resolve(`${localTarget}`);
  console.log(workingDirectory);
  console.log(destinationPath);

  dbx.filesDownloadZip({ path: dropboxDirectory }).then((response) => {
    const zipFolderPath = path.join(
      destinationPath,
      `${response.result.metadata.name}`
    );
    const zipFilePath = zipFolderPath + ".zip";
    console.log(zipFolderPath);
    console.log(zipFilePath);

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
        console.log(
          `Successfully downloaded ${dropboxDirectory} to ${destinationPath}`
        );
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        // delete temporary folders
        fs.rmSync(zipFilePath);
        fs.rmSync(zipFolderPath, { recursive: true, force: true });
      });
  });
};

module.exports = dropboxDownload;
