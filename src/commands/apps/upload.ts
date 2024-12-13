import { Command } from '@oclif/core'
import fs from 'fs'
import path from 'path'
import child_process from 'child_process'
import { replaceInFile } from 'replace-in-file'
import util from 'util'
import ora from 'ora'

import { inAppFolderOrError, isAppVersionApproved } from '../../utils/appUtils.js'
import { isLoggedInOrError } from '../../utils/configUtils.js'
import { getManifest, getManifestPath, validateManifest } from '../../utils/manifestUtils.js'
import { delay } from '../../utils/utils.js'
import apiClient from '../../utils/apiClient.js'

const execAsync = util.promisify(child_process.exec)

/**
 * In order this command executes:
 *
 * - Checks if command is executed inside a teachfloor app folder
 * - Checks if user is logged in
 * - Validates app manifest
 * - Checks if app version can be uploaded
 * - Builds production bundle
 * - Uploads dist folder
 */
export default class AppsUpload extends Command {
  static override description = 'Upload your app to be submitted for review'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  private async uploadManifest(manifest: any): Promise<any> {
    try {
      const response = await apiClient.post(`/apps/${manifest.id}/manifest`, { manifest });
      return response.data.payload;
    } catch (error) {
      if (error instanceof Error) {
        this.error(`Error uploading manifest: ${error.message}`, { exit: 1 });
      } else {
        this.error('An unknown error occurred', { exit: 1 });
      }
    }
  }

  public async run(): Promise<void> {
    /**
     * Check if the command is being run inside the app folder
     */
    inAppFolderOrError()

    /**
     * Check if user is logged in
     */
    isLoggedInOrError()

    /**
     * Validate manifest
     */
    validateManifest(getManifestPath())

    const manifest = getManifest()

    /**
     * If the app version is approved, stop the command
     * and ask user to create a new version
     */
    if (await isAppVersionApproved(manifest.id, manifest.version)) {
      this.error(`Version ${manifest.version} is already approved.`, {
        suggestions: ['Change the version property in the app manifest']
      })
    }

    const spinner = ora().start()

    /**
     * Upload manifest
     */
    spinner.text = 'Uploading manifest...'
    this.uploadManifest(manifest)

    await delay(500)

    spinner.text = 'Starting upload...'

    await delay(500)

    try {
      spinner.text = 'Building the production bundle...'
      const appDir = process.cwd()
      await execAsync('npm run build', { cwd: appDir })

      const buildDir = path.join(appDir, 'dist')
      if (!fs.existsSync(buildDir)) {
        throw new Error('Build directory not found. Ensure "npm run build" generates output in the "dist" folder.')
      }

      const bundleFiles = fs.readdirSync(buildDir)
      if (bundleFiles.length === 0) {
        throw new Error('No files found in the build directory.')
      }

      const appUrl = process.env.APP_URL
      const options = {
        files: path.join(buildDir, 'index.html'),
        from: /http:\/\/localhost/g,
        to: appUrl,
      }
      await replaceInFile(options)

      spinner.text = 'Uploading files...'
      const uploadResponse = await apiClient.post(`/apps/${manifest.id}/upload`, {
        files: bundleFiles.map((file) => ({
          name: file,
          content: fs.readFileSync(path.join(buildDir, file), 'base64'),
        })),
      })

      spinner.succeed('App uploaded successfully.')
    } catch (error) {
      spinner.fail('Failed to upload the app.')

      if (error instanceof Error) {
        this.error(`Error uploading app: ${error.message}`)
      } else {
        this.error('An unknown error occurred')
      }
    }
  }
}
