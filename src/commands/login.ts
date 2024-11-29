import { Command } from '@oclif/core'
import axios from 'axios'
import inquirer from 'inquirer'
import * as dotenv from 'dotenv'

import { setToken } from '../utils/tokenUtils.js'

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

    try {
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
      ]);

      // Make the API request
      const response = await axios.post(`${apiUrl}/oauth/token`, {
        grant_type: 'password',
        username: email,
        password,
        client_id: clientId,
        client_secret: clientSecret,
      });

      // Save the token securely to a local config file
      const token = response.data.access_token;
      setToken(token)

      this.log('Login successful!');
    } catch (error) {
      if (error instanceof Error) {
        this.error(`Login failed: ${error.message}`);
      } else {
        this.error('An unknown error occurred');
      }
    }
  }
}
