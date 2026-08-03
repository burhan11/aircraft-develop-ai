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

- Open a new terminal and run `cds-ts w`
- Create a `.env` file with the following entries:
```
OPENAI_API_KEY=`your-api-key`
```

## Build project

- Open a new terminal and run `mbt build`

## Deploy project

- Open a new terminal and run `cf deploy <zip archive>`
