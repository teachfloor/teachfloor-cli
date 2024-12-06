import { Command, Flags } from '@oclif/core'
import path from 'path'
import fs from 'fs'
import * as child_process from 'child_process'

import { getManifest, validateManifest } from '../../utils/manifestUtils.js'
import apiClient from '../../utils/apiClient.js'

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
        this.error(`Error uploading manifest: ${error.message}`);
      } else {
        this.error('An unknown error occurred');
      }
    }
  }

  public async run(): Promise<void> {
    const { flags } = await this.parse(AppsStart)

    /**
     * Current directory
     */
    const appDir = process.cwd();

    /**
     * Manifest path
     */
    const manifestPath = flags.manifest
      ? path.resolve(flags.manifest)
      : path.join(appDir, 'teachfloor-app.json');

    const distPath = path.join(appDir, 'dist');

    /**
     * Check if manifest file exists
     */
    if (!fs.existsSync(manifestPath)) {
      this.error(`Manifest file not found at ${manifestPath}.`);
    }

    /**
     * Validate manifest
     */
    validateManifest(manifestPath);

    this.uploadManifest(getManifest(manifestPath));

    /**
     * Start the development server
     */
    const devServerProcess = child_process.spawn('npm', ['start'], {
      cwd: appDir,
      stdio: 'inherit',
      shell: true,
    });

    devServerProcess.on('error', (error) => {
      this.error(`Failed to start development server: ${error.message}`);
    });

    /**
     * Stop the child process when the CLI is terminated
     */
    process.on('exit', () => {
      devServerProcess.kill();
    });
  }
}
