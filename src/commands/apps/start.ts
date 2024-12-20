import { Command, Flags } from '@oclif/core'
import path from 'path'
import fs from 'fs'
import child_process from 'child_process'
import open from 'open'

import { inAppFolderOrError, isAppVersionApproved } from '../../utils/appUtils.js'
import { getOrganization, isLoggedInOrError } from '../../utils/configUtils.js'
import { getManifest, validateManifest } from '../../utils/manifestUtils.js'
import apiClient from '../../utils/apiClient.js'

/**
 * In order this command executes:
 *
 * - Checks if command is executed inside a teachfloor app folder
 * - Checks if user is logged in
 * - Validates app manifest
 * - Checks if app version can be uploaded
 * - Uploads manifest to app / app version
 * - Starts development server
 */
export default class AppsStart extends Command {
  static override description = 'Start a development server for viewing your app in the Teachfloor Dashboard'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static override flags = {
    /**
     * flag with a value (-m, --manifest=VALUE)
     */
    manifest: Flags.string({
      char: 'm',
      description: 'Path to an extended manifest file for development',
      required: false,
    }),
  }

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

    const { flags } = await this.parse(AppsStart)

    /**
     * Current directory
     */
    const appDir = process.cwd()

    /**
     * Manifest path
     */
    const manifestPath = flags.manifest
      ? path.resolve(flags.manifest)
      : path.join(appDir, 'teachfloor-app.json')

    const distPath = path.join(appDir, 'dist')

    /**
     * Check if manifest file exists
     */
    if (!fs.existsSync(manifestPath)) {
      this.error(`Manifest file not found at ${manifestPath}.`)
    }

    /**
     * Validate manifest
     */
    validateManifest(manifestPath)

    const manifest = getManifest(manifestPath)

    /**
     * If the app version is approved, stop the command
     * and ask user to create a new version
     */
    if (await isAppVersionApproved(manifest.id, manifest.version)) {
      this.error(`Version ${manifest.version} is already approved.`, {
        suggestions: ['Change the version property in the app manifest']
      })
    }

    /**
     * Upload manifest
     */
    this.uploadManifest(manifest)

    try {
      const installAppUrl = `${process.env.APP_URL}/${getOrganization()}/courses?app=${manifest.id}@${manifest.version}`
      this.log(`Install URL: ${installAppUrl}`)
      await open(installAppUrl)
    } catch (error) {
      this.error('Failed to open URL')
    }

    /**
     * Start the development server
     */
    const devServerProcess = child_process.spawn('npm', ['start'], {
      cwd: appDir,
      stdio: 'inherit',
      shell: true,
    })

    devServerProcess.on('error', (error) => {
      this.error(`Failed to start development server: ${error.message}`)
    })

    /**
     * Stop the child process when the CLI is terminated
     */
    process.on('exit', () => {
      devServerProcess.kill()
    })
  }
}
