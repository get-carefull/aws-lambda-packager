const core = require('@actions/core')
const archiver = require('archiver')
const childProcess = require('child_process')
const fs = require('fs-extra')
const os = require('os')
const path = require('path')
const util = require('util')

const exec = util.promisify(childProcess.exec)

async function run () {
  const {GITHUB_SHA: sha, GITHUB_WORKSPACE: workspace} = process.env

  try {
    let root = core.getInput('root')
    const src = core.getInput('src')
    let name = core.getInput('packageName')

    root = path.join(workspace, root)
    const srcDir = path.join(root, src)

    switch (name) {
      case 'SHA':
        name = sha
        break
      case 'SHORT_SHA':
        name = sha.substring(0, 8)
        break
    }

    if (name.trim() === '') {
      throw new Error('Package name cannot be empty')
    }

    const packageName = `${name.trim()}.zip`

    const tmpDir = os.tmpdir()
    const outputDir = await fs.mkdtemp(`${tmpDir}${path.sep}`)

    // Copy source
    await fs.copy(srcDir, outputDir)

    // Copy package.json and package-lock.json
    await fs.copy(path.join(root, 'package.json'), path.join(outputDir, 'package.json'))
    await fs.copy(path.join(root, 'package-lock.json'), path.join(outputDir, 'package-lock.json'))

    // Get production dependencies
    await exec('npm ci --production', {cwd: outputDir})

    // Zip the project
    const outputPath = path.join(await fs.mkdtemp(`${tmpDir}${path.sep}`), packageName)
    const output = fs.createWriteStream(outputPath)
    const archive = archiver('zip', {
      zlib: {level: 9} // Sets the compression level.
    })

    output.on('close', () => {
      console.log(archive.pointer() + ' total bytes')
      console.log('archiver has been finalized and the output file descriptor has closed.')
    })

    archive.on('warning', err => {
      throw err
    })

    archive.on('error', err => {
      throw err
    })

    archive.pipe(output)
    archive.directory(outputDir, false)
    archive.finalize()

    console.log('outputPath', outputPath)

    core.setOutput('package', outputPath)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
