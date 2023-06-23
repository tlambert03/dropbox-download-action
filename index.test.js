const dropboxDownload = require("./src/dbx");
const process = require("process");
const fs = require("fs").promises;
const os = require("os");
const path = require("path");

describe("downloadTestFile", () => {
  let tempDir;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "test-")); // Create a temporary directory
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true }); // Clean up the temporary directory
  });

  it("should create a file in the temporary directory", async () => {
    await dropboxDownload("/ga_test", tempDir, process.env.DROPBOX_TOKEN);
    const files = await fs.readdir(tempDir);
    expect(files).toContain("myfile.txt"); // Assert that the file is present in the directory
  });
});
