import { Command, Args } from '@oclif/core'
import inquirer from 'inquirer'
import fs from 'fs'
import child_process from 'child_process'
import util from 'util'
import ora from 'ora'

import { createAppStructure } from '../../utils/appUtils.js'
import { delay } from '../../utils/utils.js'
import apiClient from '../../utils/apiClient.js'

const execAsync = util.promisify(child_process.exec)

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

  private async createApp(data: any): Promise<any> {
    try {
      const response = await apiClient.post('/apps', {
        ...data,
        // url: 'http://localhost:3000',
        meta: {
          source: 'cli',
          description: data.description,
          version: data.version,
          sandbox_url: 'http://localhost:3000',
        }
      });
      return response.data.payload;
    } catch (error) {
      if (error instanceof Error) {
        this.error(`Error creating app: ${error.message}`);
      } else {
        this.error('An unknown error occurred');
      }
    }
  }

  public async run(): Promise<void> {
    const { args } = await this.parse(AppsCreate)

    /**
     * Prompt the user for app details
     */
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

    const spinner = ora('Creating app...').start()

    /**
     * Create app
     */
    const app = await this.createApp(answers)

    const appDir = args.appSlug

    /**
     * Create the extension directory under the base folder
     */
    const dir = appDir
    if (fs.existsSync(dir)) {
      spinner.fail(`Folder "${appDir}" already exists.`)
      return;
    }
    fs.mkdirSync(dir, { recursive: true })

    /**
     * Create the app structure
     */
    spinner.text = 'Setting up app structure...'
    createAppStructure(dir, app, answers.version)

    await delay(1000)

    /**
     * Install npm dependencies
     */
    try {
      spinner.text = 'Installing npm dependencies...'
      // child_process.execSync('npm install', { cwd: dir, stdio: 'pipe' });
      await execAsync('npm install', { cwd: dir })
    } catch (error) {
      spinner.fail('Failed to install React dependencies. Please install them manually.')
    }

    spinner.succeed(`App "${answers.name}" created successfully in "${dir}".`)
  }
}
