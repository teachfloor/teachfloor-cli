import { Command } from '@oclif/core'
import inquirer from 'inquirer'
import ora from 'ora'

import { getManifestValue, removeManifestPermission } from '../../../utils/manifestUtils.js'
import { inAppFolderOrError } from '../../../utils/appUtils.js'
import { delay } from '../../../utils/utils.js'

export default class AppsRevokePermission extends Command {
  static override description = 'Revoke a permission'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  public async run(): Promise<void> {
    /**
     * Check if the command is being run inside the app folder
     */
    inAppFolderOrError()

    /**
     * Get existing permission from the manifest
     */
    const existingPermissions = getManifestValue('permissions') || []
    const existingPermissionNames = existingPermissions.map((permission: { permission: string }) => permission.permission)

    /**
     * Prompt the user for permission details
     */
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'permissionName',
        message: 'Select the permission you want to revoke:',
        choices: existingPermissionNames,
      }
    ])

    const { permissionName } = answers

    const spinner = ora().start()

    await delay(1500)

    /**
     * Update app manifest
     */
    removeManifestPermission(permissionName)
    spinner.text = 'Manifest file updated'

    await delay(1200)
    spinner.succeed(`Permission "${permissionName}" revoked successfully.`)
  }
}
