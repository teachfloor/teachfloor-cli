import { Command } from '@oclif/core'
import inquirer from 'inquirer'
import ora from 'ora'

import { getManifestValue, addManifestPermission } from '../../../utils/manifestUtils.js'
import { inAppFolderOrError } from '../../../utils/appUtils.js'
import { delay } from '../../../utils/utils.js'
import apiClient from '../../../utils/apiClient.js'

export default class AppsGrantPermission extends Command {
  static override description = 'Grant a permission'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  private async fetchPermissions(): Promise<any> {
    const spinner = ora().start()

    try {
      const response = await apiClient.get('/apps/available-permissions')
      spinner.succeed()
      return response.data.payload
    } catch (error) {
      spinner.fail('Failed fetching permissions')

      if (error instanceof Error) {
        this.error(`Error fetching permissions: ${error.message}`)
      } else {
        this.error('An unknown error occurred')
      }
    }
  }

  public async run(): Promise<void> {
    /**
     * Check if the command is being run inside the app folder
     */
    inAppFolderOrError()

    /**
     * Fetch permissions from the API
     */
    const permissions = await this.fetchPermissions()

    if (permissions.length === 0) {
      this.error('No permissions available.')
    }

    /**
     * Get existing permission from the manifest
     */
    const existingPermissions = getManifestValue('permissions') || []
    const existingPermissionNames = existingPermissions.map((permission: { permission: string }) => permission.permission)

    /**
     * Filter out already added permissions from the list of choices
     */
    const availablePermissions = permissions.filter(
      (permission: string) => !existingPermissionNames.includes(permission)
    )

    if (availablePermissions.length === 0) {
      this.error('All permissions have already been granted.')
    }

    /**
     * Prompt the user for permission details
     */
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'permissionName',
        message: 'Select the permission you want to grant:',
        choices: availablePermissions,
      },
      {
        type: 'input',
        name: 'explanation',
        message: 'Explain why this permission is needed:',
        validate: (value) => (value ? true : 'Explanation is required'),
      }
    ])

    const { permissionName, explanation } = answers

    const spinner = ora().start()

    await delay(1500)

    /**
     * Update app manifest
     */
    addManifestPermission(permissionName, explanation)
    spinner.text = 'Manifest file updated'

    await delay(1200)
    spinner.succeed(`Permission "${permissionName}" added successfully.`)
  }
}
