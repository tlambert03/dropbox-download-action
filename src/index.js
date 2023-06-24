const core = require("@actions/core");
const dbx = require("./dbx");

// most @actions toolkit packages have async methods
async function run() {
  try {
    const refreshToken = core.getInput("dropbox-refresh-token");
    const appKey = core.getInput("dropbox-app-key");
    const appSecret = core.getInput("dropbox-app-secret");
    const dbxPath = core.getInput("source-path");
    const localTarget = core.getInput("dest-path");

    dbx.dropboxDownload(dbxPath, localTarget, refreshToken, appKey, appSecret);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
