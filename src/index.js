const core = require("@actions/core");
const fs = require("fs").promises;
const path = require("path");
const { Dropbox } = require("dropbox");
const StreamZip = require("node-stream-zip");

const extractZip = (zip, destinationDir) => {
  return new Promise((resolve, reject) => {
    zip.extract(null, destinationDir, (err, count) => {
      if (err) {
        reject(err);
      } else {
        resolve(count);
      }
    });
  });
};

// most @actions toolkit packages have async methods
async function run() {
  try {
    const accessToken = core.getInput("dropbox-token");
    const sourcePath = core.getInput("source-path");
    const destPath = core.getInput("dest-path");

    const dbx = new Dropbox({ accessToken });
    data = await dbx.filesDownloadZip({ path: sourcePath });

    // await fs.mkdir(destPath, { recursive: true });
    // // unzip the data into destPath
    // const zip = new StreamZip({
    //   file: data.result.fileBinary,
    //   storeEntries: true, // This option will store the entries in memory for faster access
    // });

    // const count = await extractZip(zip, destPath);
    // console.log(`Extracted ${count} entries to ${destPath}`);

    // console.log(`File: ${data.result.name} saved.`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

// await fs.writeFile(
//   path.join(destPath, data.result.name),
//   data.result.fileBinary,
//   "binary"
// );
