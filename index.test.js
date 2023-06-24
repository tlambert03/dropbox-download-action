const dbx = require("./src/dbx");
const process = require("process");
const fs = require("fs").promises;
const os = require("os");
const path = require("path");

describe("downloadTestFile", () => {
  let tempDir;

  beforeEach(async () => {
    // Create a temporary directory
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "test-"));
  });

  afterEach(async () => {
    // Clean up the temporary directory
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it("should download myfile.txt from dropbox", async () => {
    await dbx.dropboxDownload(
      "/ga_test",
      tempDir,
      process.env.DROPBOX_REFRESH_TOKEN,
      process.env.DROPBOX_APP_KEY,
      process.env.DROPBOX_APP_SECRET
    );
    const files = await fs.readdir(tempDir);

    // Assert that the file is present in the directory
    expect(files).toContain("myfile.txt");
  });
});

test("downloadTestFile", async () => {
  const token = await dbx.getAccessToken(
    process.env.DROPBOX_REFRESH_TOKEN,
    process.env.DROPBOX_APP_KEY,
    process.env.DROPBOX_APP_SECRET
  );
  // assert token is not null or undefined
  expect(token).not.toBeNull();
  expect(token).not.toBeUndefined();
});
