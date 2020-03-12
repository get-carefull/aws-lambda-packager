# AWS Lambda Packager action

GitHub action that will package a Node.js project for deployment to AWS Lambda.

## Inputs

### `root`

**Required** Project root directory, relative to _GITHUB_WORKSPACE_. Default `"."`.

### `src`

**Required** Project source directory, relative to root. Default `"src"`.

### `packageName`

**Required** The name of the packaged project. One of "SHA" (the current commit SHA), "SHORT_SHA" (the current commit short SHA) or a literal to use. Default `"SHORT_SHA"`.

## Outputs

### `path`

The directory path to the resulting packaged project.

### `name`

The file name of the resulting packaged project

## Example usage

```yaml
uses: get-carefull/aws-lambda-packager
with:
  root: '/root'
  src: 'my_src'
  packageName: 'my_package'
```
