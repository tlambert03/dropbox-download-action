const core = require("@actions/core");
const fs = require("fs").promises;
const path = require("path");
const { Dropbox } = require("dropbox");

// most @actions toolkit packages have async methods
async function run() {
  try {
    const accessToken = core.getInput("dropbox-token");
    const path = core.getInput("source-path");
    const destPath = core.getInput("dest-path");

    const dbx = new Dropbox({ accessToken });
    data = await dbx.filesDownload({ path });
    
    await fs.mkdir(destPath, { recursive: true });
    await fs.writeFile(
      path.join(destPath, data.result.name),
      data.result.fileBinary,
      "binary"
    );
    console.log(`File: ${data.result.name} saved.`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
