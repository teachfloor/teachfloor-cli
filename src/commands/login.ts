import { Command } from '@oclif/core'
import axios from 'axios'
import inquirer from 'inquirer'
import dotenv from 'dotenv'
import ora from 'ora'

import { setToken, setOrganization } from '../utils/configUtils.js'
import apiClient from '../utils/apiClient.js'
import { delay } from '../utils/utils.js'

dotenv.config();

export default class Login extends Command {
  static override description = 'Authenticate with the Teachfloor API and save the token locally';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  public async run(): Promise<void> {
    const apiUrl = process.env.API_URL;
    const clientId = process.env.CLIENT_ID;
    const clientSecret = process.env.CLIENT_SECRET;

    if (!apiUrl || !clientId || !clientSecret) {
      this.error('Missing required environment variables. Check your .env file.');
      return;
    }

    this.log('Authenticating with the Teachfloor API...');

    // Prompt the user for email and password
    const { email, password } = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Enter your email:',
        validate: (value: string) => (value ? true : 'Email is required'),
      },
      {
        type: 'password',
        name: 'password',
        message: 'Enter your password:',
        mask: '*',
        validate: (value: string) => (value ? true : 'Password is required'),
      },
    ])

    let spinner = ora('Logging in...').start()

    try {

      /**
       * Make the API request
       */
      const response = await axios.post(`${apiUrl}/oauth/token`, {
        grant_type: 'password',
        username: email,
        password,
        client_id: clientId,
        client_secret: clientSecret,
      });

      spinner.succeed()

      /**
       * Select organization
       */
      const organizationsResponse = await apiClient.get('/me/organizations')
      const organizations = organizationsResponse.data.payload

      let selectedOrganization

      /**
       * Handle multiple organizations
       */
      if (organizations.length === 1) {
        selectedOrganization = organizations[0];
        this.log(`Automatically selected organization: ${selectedOrganization.name}`);
      } else if (organizations.length > 1) {
        const { organizationSlug } = await inquirer.prompt([
          {
            type: 'list',
            name: 'organizationSlug',
            message: 'Select an organization:',
            choices: organizations.map((org: any) => ({
              name: `${org.name} (${org.slug})`,
              value: org.slug,
            })),
          },
        ]);

        selectedOrganization = organizations.find((org: any) => org.slug === organizationSlug);
      } else {
        throw new Error('No organizations available for this user.');
      }

      spinner = ora('Storing credentials...').start()

      /**
       * Save token in local config file
       */
      const token = response.data.access_token;
      setToken(token)

      /**
       * Save organization in local config file
       */
      setOrganization(selectedOrganization.slug);

      await delay(1000)

      spinner.succeed('Login successful!')
    } catch (error) {
      if (error instanceof Error) {
        spinner.fail(`Login failed: ${error.message}`);
      } else {
        spinner.fail('An unknown error occurred');
      }
    }
  }
}
