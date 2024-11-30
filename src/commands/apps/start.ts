import { Command, Flags } from '@oclif/core'
import path from 'path'
import fs from 'fs'
import * as child_process from 'child_process'

import { validateManifest } from '../../utils/manifestUtils.js'

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
