const dropboxDownload = require("./src/dbx");
const process = require("process");

test("download works", async () => {
  dropboxDownload("/ga_test", ".", process.env.DROPBOX_TOKEN);
});
