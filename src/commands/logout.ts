import { Command } from '@oclif/core'
import ora from 'ora'

import { delay } from '../utils/utils.js'
import { deleteConfigs, getToken } from '../utils/configUtils.js'
import apiClient from '../utils/apiClient.js'

export default class Logout extends Command {
  static override description = 'Logout from Teachfloor and remove the credentials stored locally';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  private async logout(): Promise<any> {
    try {
      const response = await apiClient.post('/logout')
      return response.data.payload
    } catch (error) {
      if (error instanceof Error) {
        this.error(`Error logging out: ${error.message}`)
      } else {
        this.error('An unknown error occurred')
      }
    }
  }

  public async run(): Promise<void> {
    const apiUrl = process.env.API_URL;
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;

    if (!apiUrl || !clientId || !clientSecret) {
      this.error('Missing required environment variables. Check your .env file.');
      return;
    }

    if (!getToken()) {
      this.log('You are not logged in.')
      return;
    }

    const spinner = ora().start()

    try {
      spinner.text = 'Logging out...'
      await this.logout()
    } catch (error) {
      spinner.fail('Failed logging out.');
      return;
    }

    /**
     * Delete configuration file .teachfloorrc
    */
    spinner.text = 'Deleting local credentials...'
    deleteConfigs()

    await delay(1000)

    spinner.succeed('Logout successful!')
  }
}
