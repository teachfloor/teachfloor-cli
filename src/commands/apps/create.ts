import {Command} from '@oclif/core'
import inquirer from 'inquirer'
import * as fs from 'fs'
import * as path from 'path'
import * as child_process from 'child_process'

export default class AppsCreate extends Command {
  static override description = 'Create a new app'

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  public async run(): Promise<void> {
    // Define the base folder for apps
    const baseFolder = path.resolve(process.cwd(), 'apps');

    // Ensure the base folder exists
    if (!fs.existsSync(baseFolder)) {
      fs.mkdirSync(baseFolder, { recursive: true });
    }

    // Prompt the user for extension details
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Name:',
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
      // {
      //   type: 'confirm',
      //   name: 'useReact',
      //   message: 'Do you want to include React support?',
      //   default: true,
      // },
    ]);

    // Create the extension directory under the base folder
    const dir = path.join(baseFolder, answers.name);
    if (fs.existsSync(dir)) {
      this.error(`An extension named "${answers.name}" already exists in the "${baseFolder}" folder.`);
      return;
    }
    fs.mkdirSync(dir, { recursive: true });

    // Write manifest.json
    const manifest = {
      name: answers.name,
      description: answers.description,
      version: answers.version,
      entry: 'src/index.js',
    };
    fs.writeFileSync(path.join(dir, 'teachfloor-app.json'), JSON.stringify(manifest, null, 2));

    // Create basic project structure
    fs.mkdirSync(path.join(dir, 'src'));
    fs.writeFileSync(path.join(dir, 'README.md'), `# ${answers.name}\n\n${answers.description}`);

    this.log('Setting up React environment...');
    fs.writeFileSync(
      path.join(dir, 'src/index.js'),
      `
import React from 'react';
import ReactDOM from 'react-dom';

const App = () => <div>Hello, ${answers.name}!</div>;

ReactDOM.render(<App />, document.getElementById('root'));
        `.trim()
    );

    // Install React dependencies
    try {
      child_process.execSync('npm init -y && npm install react react-dom', { cwd: dir, stdio: 'inherit' });
    } catch (error) {
      this.error('Failed to install React dependencies. Please install them manually.');
    }

    this.log(`Extension "${answers.name}" created successfully in ${dir}`);
  }
}
