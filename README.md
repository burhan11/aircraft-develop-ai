# Preorder Tool

## Project Structure

| File or Folder | Purpose                              |
| -------------- | ------------------------------------ |
| `app/`         | content for UI frontends goes here   |
| `db/`          | your domain models and data go here  |
| `srv/`         | your service models and code go here |
| `package.json` | project metadata and configuration   |
| `readme.md`    | this getting started guide           |

## Start development mode

- Go to `db/synced/schema.cds` and remove `@cds.persistence.exists` annotations (!DO NOT COMMIT THESE CHANGES!)
- Open a new terminal and run `cds-ts w`
- Create a `.env` file with the following entries:
  ```
  AWS_S3_ACCESS_KEY_ID=
  AWS_S3_SECRET_KEY=
  AWS_S3_REGION=eu-central-1
  AWS_S3_BUCKET=test
  GROUPS=["1","2"]
  ```

## Build project

- Open a new terminal and run `mbt build`

## Deploy project

- Open a new terminal and run `cf deploy <zip archive>`
