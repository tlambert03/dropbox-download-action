const core = require("@actions/core");
const dropboxDownload = require("./dbx");

// most @actions toolkit packages have async methods
async function run() {
  try {
    const accessToken = core.getInput("dropbox-token");
    const dbxPath = core.getInput("source-path");
    const localTarget = core.getInput("dest-path");

    dropboxDownload(dbxPath, localTarget, accessToken);
    console.log(`File: ${data.result.name} saved.`);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
