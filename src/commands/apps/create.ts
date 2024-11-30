import { Command, Args } from '@oclif/core'
import inquirer from 'inquirer'
import * as fs from 'fs'
import * as child_process from 'child_process'

import { createAppStructure } from '../../utils/appUtils.js'

export default class AppsCreate extends Command {
  static args = {
    appSlug: Args.string({
      description: 'name of the app',
      required: true,
    }),
  }

  static override description = 'Create a new app'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  public async run(): Promise<void> {
    const { args } = await this.parse(AppsCreate)

    // Prompt the user for extension details
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'appId',
        message: 'App ID:',
        default: () => `${args.appSlug.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
      },
      {
        type: 'input',
        name: 'name',
        message: 'Display Name:',
        validate: (value) => (value ? true : 'Name is required'),
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description:',
        validate: (value) => (value ? true : 'Description is required'),
      },
      {
        type: 'input',
        name: 'version',
        message: 'Version:',
        default: '1.0.0',
        validate: (value) => (value.match(/^\d+\.\d+\.\d+$/) ? true : 'Version must be in semver format (e.g., 1.0.0)'),
      },
    ]);

    const appDir = args.appSlug

    // Create the extension directory under the base folder
    const dir = appDir
    if (fs.existsSync(dir)) {
      this.error(`An extension named "${answers.name}" already exists in the "${appDir}" folder.`);
      return;
    }
    fs.mkdirSync(dir, { recursive: true });

    // Create the app structure
    this.log('Setting up app structure...');
    createAppStructure(dir, answers.appId, answers.name, answers.description, answers.version);

    // Install npm dependencies
    try {
      child_process.execSync('npm install', { cwd: dir, stdio: 'inherit' });
    } catch (error) {
      this.error('Failed to install React dependencies. Please install them manually.');
    }

    this.log(`Extension "${answers.name}" created successfully in ${dir}`);
  }
}
