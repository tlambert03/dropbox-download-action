const dropboxDownload = require("./src/dbx");
const process = require("process");
const cp = require("child_process");
const path = require("path");

test("test download", async () => {
  await dropboxDownload("/ga_test", ".", process.env.DROPBOX_TOKEN);
});
