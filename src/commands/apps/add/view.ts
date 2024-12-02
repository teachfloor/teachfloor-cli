import { Command } from '@oclif/core'
import inquirer from 'inquirer'
import fs from 'fs'
import path from 'path'

import { getManifestPath, validateManifest } from '../../../utils/manifestUtils.js'
import { inAppFolderOrError, createView } from '../../../utils/appUtils.js'
import { VIEWPORTS } from '../../../config.js'

export default class AppsAddView extends Command {
  static override description = 'Add a new view'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  public async run(): Promise<void> {
    /**
     * Check if the command is being run inside the app folder
     */
    inAppFolderOrError();

    // Prompt the user for extension details
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'viewport',
        message: 'Select the viewport for your view:',
        choices: VIEWPORTS,
      },
      {
        type: 'input',
        name: 'componentName',
        message: 'Enter the name of your component:',
        default: (answers): string => {
          const viewport = answers.viewport

          const parts = viewport.includes('.') ? viewport.split('.').slice(2) : [viewport];

          /**
           * Capitalize each part and join them
           */
          const formattedParts = parts.map((part: string) => {
            return part.charAt(0).toUpperCase() + part.slice(1);
          });

          return formattedParts.join('') + 'View';
        },
        validate: (input: string) => (
          /^[A-Z][a-zA-Z0-9]*$/.test(input)
            ? true
            : 'Component name must be in PascalCase and start with an uppercase letter.'
        ),
      },
    ]);

    const { viewport, componentName } = answers;

    // Create React component file
    const componentPath = createView(componentName);
    this.log(`Component view created at ${componentPath}`);

    // Update app manifest
    this.updateManifest(viewport, componentName);

    this.log(`View "${componentName}" added successfully under "${viewport}".`);
  }

  private updateManifest(viewport: string, componentName: string): void {
    const manifestPath = getManifestPath();

    validateManifest(manifestPath)

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    manifest.ui_extension = manifest.ui_extension || {};
    manifest.ui_extension.views = manifest.ui_extension.views || [];
    manifest.ui_extension.views.push({
      viewport,
      component: componentName,
    });

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    this.log('Manifest file updated.');
  }
}
