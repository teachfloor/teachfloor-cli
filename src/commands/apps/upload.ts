import { Command } from '@oclif/core'
import fs from 'fs'
import path from 'path'
import child_process from 'child_process'
import util from 'util'
import ora from 'ora'

import { inAppFolderOrError } from '../../utils/appUtils.js'
import { getManifest, getManifestPath, validateManifest } from '../../utils/manifestUtils.js'
import { delay } from '../../utils/utils.js'
import apiClient from '../../utils/apiClient.js'

const execAsync = util.promisify(child_process.exec)

export default class AppsUpload extends Command {
  static override description = 'Upload your app to be submitted for review'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  public async run(): Promise<void> {
    /**
     * Check if the command is being run inside the app folder
     */
    inAppFolderOrError()

    /**
     * Validate manifest
     */
    validateManifest(getManifestPath())

    const manifest = getManifest()

    const spinner = ora('Starting upload...').start()

    await delay(500)

    try {
      spinner.text = 'Building the production bundle...'
      const appDir = process.cwd()
      await execAsync('npm run build', { cwd: appDir })

      const buildDir = path.join(appDir, 'dist')
      if (!fs.existsSync(buildDir)) {
        throw new Error('Build directory not found. Ensure "npm run build" generates output in the "dist" folder.');
      }

      const bundleFiles = fs.readdirSync(buildDir);
      if (bundleFiles.length === 0) {
        throw new Error('No files found in the build directory.');
      }

      spinner.text = 'Uploading files...';
      const uploadResponse = await apiClient.post(`/apps/${manifest.id}/upload`, {
        files: bundleFiles.map((file) => ({
          name: file,
          content: fs.readFileSync(path.join(buildDir, file), 'base64'),
        })),
      });

      spinner.succeed('App uploaded successfully.');
    } catch (error) {
      spinner.fail('Failed to upload the app.');

      if (error instanceof Error) {
        this.error(`Error uploading app: ${error.message}`);
      } else {
        this.error('An unknown error occurred');
      }
    }
  }
}
