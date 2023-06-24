# dropbox-download-action

Use Dropbox API (rather than shared links) to download files from a Dropbox app folder to a local folder on the runner.

## Usage in a workflow

You can now consume the action by referencing the v1 branch.
Enter the `DROPBOX_REFRESH_TOKEN`, `DROPBOX_APP_KEY`, and
`DROPBOX_APP_SECRET` gathered in the "one time setup" process
described below.

```yaml
uses: tlambert03/dropbox-download-action@v1
with:
  dropbox-refresh-token: ${{ secrets.DROPBOX_REFRESH_TOKEN }}
  dropbox-app-key: ${{ secrets.DROPBOX_APP_KEY }}
  dropbox-app-secret: ${{ secrets.DROPBOX_APP_SECRET }}
  source-path: "/some/folder/in/your/dropbox/app/folder"
  dest-path: "local/path/where/you/want/the/files"
```

The *contents* of `source-path` will be downloaded into the
`dest-path` on the runner (not `source-path` the folder itself).

## One time setup

This action requires that you have a dropbox developer account and have created an app in the Dropbox App Console, and have generated a refresh token for that app.

1. Create a new app in the Dropbox App Console: <https://www.dropbox.com/developers/apps/create>
2. Select the "Scoped access" API option
3. Select the "App folder" option
4. Give your app a name
5. Click the "Create app" button
6. In the Permissions tab, under "Files and folders", select the following
   options, then click the "Submit" button:
    - files.metadata.read
    - files.content.read
7. In the Settings tab, under "OAuth 2", click the "Generate" button to
   generate an access token for your app
8. To generate a refreshToken, run the following bash script (from [this stackoverflow answer](https://stackoverflow.com/a/72491554)):

  ```bash
  #!/bin/bash
  echo -n "Enter APP_KEY: "
  read -r APP_KEY

  echo -n "Enter APP_SECRET: " 
  read -r APP_SECRET
  BASIC_AUTH=$(echo -n $APP_KEY:$APP_SECRET | base64)

  echo "Navigate to this URL and get ACCESS CODE..."
  echo
  echo "https://www.dropbox.com/oauth2/authorize?client_id=$APP_KEY&token_access_type=offline&response_type=code"
  echo
  echo -n "... then enter the ACCESS CODE you received above: " 
  read -r ACCESS_CODE_GENERATED

  curl --location --request POST 'https://api.dropboxapi.com/oauth2/token' \
  --header "Authorization: Basic $BASIC_AUTH" \
  --header 'Content-Type: application/x-www-form-urlencoded' \
  --data-urlencode "code=$ACCESS_CODE_GENERATED" \
  --data-urlencode 'grant_type=authorization_code'
  ```
