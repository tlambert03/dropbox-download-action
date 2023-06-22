const core = require("@actions/core");
const fs = require("fs").promises;
const path = require("path");
const { Dropbox } = require("dropbox");
const yauzl = require("yauzl");

const extractZip = (zipData, destinationDir) => {
  return new Promise((resolve, reject) => {
    // Create a temporary file path to write the zip data
    const tempFilePath = path.join(destinationDir, "temp.zip");

    // Write the zip data to the temporary file
    fs.writeFile(tempFilePath, zipData, (err) => {
      if (err) {
        reject(err);
        return;
      }

      // Open the temporary file with yauzl
      yauzl.open(tempFilePath, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          reject(err);
          return;
        }

        // Ensure the destination directory exists
        if (!fs.existsSync(destinationDir)) {
          fs.mkdirSync(destinationDir, { recursive: true });
        }

        // Extract each entry in the zip file
        zipfile.readEntry();
        zipfile.on("entry", (entry) => {
          if (/\/$/.test(entry.fileName)) {
            // Directory entry, create the directory
            fs.mkdirSync(path.join(destinationDir, entry.fileName), {
              recursive: true,
            });
            zipfile.readEntry();
          } else {
            // File entry, extract the file
            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) {
                reject(err);
                return;
              }

              const writeStream = fs.createWriteStream(
                path.join(destinationDir, entry.fileName)
              );
              readStream.pipe(writeStream);
              writeStream.on("close", () => {
                zipfile.readEntry();
              });
            });
          }
        });

        // Close the zip file once all entries are extracted
        zipfile.on("end", () => {
          zipfile.close();
          fs.unlinkSync(tempFilePath); // Remove the temporary zip file
          resolve();
        });
      });
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
    let { result } = await dbx.filesDownloadZip({ path: sourcePath });

    await fs.mkdir(destPath, { recursive: true });
    // unzip the data into destPath
    await extractZip(result.fileBinary, destPath);
    console.log(`${result.name} saved.`);
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
