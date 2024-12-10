import * as fs from 'fs'
import path from 'path'

import { App } from '../types/app.types.js'

/**
 * Check if the command is being run inside the app folder
 */
export const isAppFolder = (): boolean => {
  const requiredFiles = ['teachfloor-app.json'];
  return requiredFiles.every((file) => fs.existsSync(path.join(process.cwd(), file)));
}

export const inAppFolderOrError = (): void => {
  if (!isAppFolder()) {
    throw new Error(
      'This command must be run inside a Teachfloor extension app folder.'
    );
  }
}

const getSDKSnippet = (id: string) => (
  `<!-- Teachfloor SDK -->
    <script>
        (function (t, c, h, f, l, r) {
            t.tf = t.tf || function () { (t.tf.q = t.tf.q || []).push(arguments) }
            t._tfOpts = { id: '${id}' }
            l = c.getElementsByTagName('head')[0];
            r = c.createElement('script');
            r.async = 1;
            r.src = h + t._tfOpts.id + f + Date.now();
            l.appendChild(r)
        })(window, document, '${process.env.APP_URL || 'https://app.teachfloor.com'}/apps/', '.js?ver=')
    </script>
    <!-- End Teachfloor SDK -->`
)

const getIndexHtmlSnippet = (appName: string, sdkSnippet: string) => (
`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName}</title>
  ${sdkSnippet}
</head>
<body>
  <div id="root"></div>
</body>
</html>`
)

const getWebpackConfigSnippet = () => (
`const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    port: ${parseInt(process.env.PORT || '3000', 10)},
    open: true,
    hot: true,
  },
  devtool: false,
  cache: {
    type: 'filesystem',
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html', // Path to your template
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.jsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  ignoreWarnings: [
    {
      module: /ExtensionViewLoader\.js/,
      message: /the request of a dependency is an expression/,
    },
  ],
};`
)

const getExampleViewSnippet = () => (
`import React from 'react';
import { ExtensionViewLoader } from '@teachfloor/extension-kit'

import manifest from '../../teachfloor-app.json';

const App = () => {
  return (
    <ExtensionViewLoader
      manifest={manifest}
      componentResolver={(componentName) => import(\`./\${componentName}\`)}
    />
  );
};

export default App;
`
)

const getIndexJsSnippet = () => (
`import React from 'react';
import ReactDOM from 'react-dom/client';
import { ExtensionContextProvider } from '@teachfloor/extension-kit'

import App from './views/App';

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <ExtensionContextProvider>
    <App />
  </ExtensionContextProvider>
);
`
)

const getExampleSettingsViewContent = () => (
`import React, { useState } from 'react'
import {
  SettingsView,
  SimpleGrid,
  Textarea,
  Select,
} from '@teachfloor/extension-kit'

const AppSettings = () => {
  const [status, setStatus] = useState('');

  const saveSettings = async (values) => {
    setStatus('Saving...')

    try {
      const { language, description } = values;

      const result = await fetch('https://www.my-api.com',
        {
          method: 'POST',
          body: JSON.stringify({
            description,
            language,
          }),
        }
      );
      await result.text();
      // Update the form status with a success message.
      setStatus('Saved!');
    } catch (error) {
      console.error(error);
      // Update the form status with an error message.
      setStatus('There was an error saving your settings.');
    }
  }

  return (
    <SettingsView onSave={saveSettings} statusMessage={status}>
      <SimpleGrid>
        <Textarea
          name="description"
          label="Description"
          placeholder="Description"
          minRows={4}
          autosize
        />
        <Select
          name="language"
          label="Language"
          placeholder="Language"
          data={[
            { value: 'en', label: 'English' },
            { value: 'it', label: 'Italian' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
          ]}
        />
      </SimpleGrid>
    </SettingsView>
  )
}

export default AppSettings
`.trim()
)

const getExampleViewContent = () => (
`import React, { useEffect } from 'react'
import {
  Container,
  SimpleGrid,
  Grid,
  Group,
  Text,
  Tabs,
  Avatar,
  Divider,
  Button,
  showDrawer,
  hideDrawer,
  useExtensionContext,
} from '@teachfloor/extension-kit'

const CourseDetailView = () => {
  const { userContext, environment, appContext } = useExtensionContext()

  /**
   * Toggle the app drawer whenever the
   * user enters/leaves this viewport
   */
  useEffect(() => {
    showDrawer()
    return () => hideDrawer()
  }, [])

  return (
    <Tabs defaultValue="context">
      <Tabs.List grow position="center">
        <Tabs.Tab value="context" p="sm">Context</Tabs.Tab>
        <Tabs.Tab value="reference" p="sm">Reference</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="context" pt="lg">
        <Container>
          <SimpleGrid verticalSpacing="lg">
            <Divider label="User Details" />
            <SimpleGrid verticalSpacing="xs">
              <Grid>
                <Grid.Col span={4}>
                  <Text fw={500} size="sm">ID: </Text>
                </Grid.Col>
                <Grid.Col span="auto">
                  <Text size="sm">{userContext.id}</Text>
                </Grid.Col>
              </Grid>
              <Grid align="center">
                <Grid.Col span={4}>
                  <Text fw={500} size="sm">Full Name: </Text>
                </Grid.Col>
                <Grid.Col span="auto">
                  <Group spacing="xs">
                    <Avatar src={userContext.avatar} size="sm" />
                    <Text size="sm">{userContext.full_name}</Text>
                  </Group>
                </Grid.Col>
              </Grid>
              <Grid>
                <Grid.Col span={4}>
                  <Text fw={500} size="sm">Email: </Text>
                </Grid.Col>
                <Grid.Col span="auto">
                  <Text size="sm">{userContext.email}</Text>
                </Grid.Col>
              </Grid>
              <Grid>
                <Grid.Col span={4}>
                  <Text fw={500} size="sm">Language: </Text>
                </Grid.Col>
                <Grid.Col span="auto">
                  <Text size="sm">{userContext.language}</Text>
                </Grid.Col>
              </Grid>
              <Grid>
                <Grid.Col span={4}>
                  <Text fw={500} size="sm">Timezone: </Text>
                </Grid.Col>
                <Grid.Col span="auto">
                  <Text size="sm">{userContext.timezone}</Text>
                </Grid.Col>
              </Grid>
            </SimpleGrid>
            <Divider label="App Details" />
            <SimpleGrid verticalSpacing="xs">
              <Grid>
                <Grid.Col span={4}>
                  <Text fw={500} size="sm">App ID: </Text>
                </Grid.Col>
                <Grid.Col span="auto">
                  <Text size="sm">{appContext.id}</Text>
                </Grid.Col>
              </Grid>
              <Grid>
                <Grid.Col span={4}>
                  <Text fw={500} size="sm">App Name: </Text>
                </Grid.Col>
                <Grid.Col span="auto">
                  <Text size="sm">{appContext.name}</Text>
                </Grid.Col>
              </Grid>
            </SimpleGrid>
            <Divider label="Environment" />
            <SimpleGrid verticalSpacing="xs">
              <Grid>
                <Grid.Col span={4}>
                  <Text fw={500} size="sm">Viewport: </Text>
                </Grid.Col>
                <Grid.Col span="auto">
                  <Text size="sm">{environment.viewport}</Text>
                </Grid.Col>
              </Grid>
            </SimpleGrid>
          </SimpleGrid>
        </Container>
      </Tabs.Panel>

      <Tabs.Panel value="reference" pt="lg">
        <Container>
          <SimpleGrid>
            <Text fw={500} size="lg">Use Teachfloor's library of components to quickly build your user interface.</Text>
            <Text size="sm">If your app needs a frontend, follow the reference documentation to compose a UI. Teachfloor's library of prebuilt components has customizable properties to help you quickly build apps aligned to Teachfloor best practices. Use components to structure layouts and create graphical or interactive experiences in your apps.</Text>
            <Button size="sm" onClick={() => window.open('https://api.teachfloor.com/docs', '_blank').focus()}>Open Documentation</Button>
          </SimpleGrid>
        </Container>
      </Tabs.Panel>
    </Tabs>
  )
}

export default CourseDetailView
`.trim()
)

export const createAppStructure = (rootDir: string, app: App, version: string) => {
  /**
   * TODO - Get the SDK snippet from api
   */
  const sdkSnippet = getSDKSnippet(app.id)

  /**
   * App folders that will be created
   */
  const folders = [
    `${rootDir}/src/views`,
    `${rootDir}/public`,
    `${rootDir}/.vscode`,
  ];

  /**
   * App fildes/content that will be created
   */
  const files = {
    /**
     * src/index.js
     */
    [`${rootDir}/src/index.js`]: getIndexJsSnippet(),

    /**
     * View example
     */
    [`${rootDir}/src/views/App.jsx`]: getExampleViewSnippet(),

    /**
     * App manifest
     */
    [`${rootDir}/teachfloor-app.json`]: JSON.stringify({
      id: app.id,
      version,
      name: app.name,
      description: app.description,
      distribution_type: 'private',
      post_install_action: {
        type: 'external',
        url: 'https://example.com',
      },
    }, null, 2),

    /**
     * App package.json
     */
    [`${rootDir}/package.json`]: JSON.stringify({
      name: app.name,
      version: version,
      description: app.description,
      main: 'src/index.js',
      scripts: {
        start: "webpack serve --mode development --open",
        build: "webpack --mode production",
        dev: "webpack serve --mode development --open",
      },
      devDependencies: {
        webpack: '^5.0.0',
        'webpack-cli': '^4.0.0',
        'webpack-dev-server': '^4.0.0',
        'babel-loader': '^8.0.0',
        '@babel/core': '^7.20.0',
        '@babel/preset-env': '^7.20.0',
        '@babel/preset-react': '^7.18.0',
        'ts-loader': '^9.0.0',
        'typescript': '^4.0.0',
        '@types/react': '^18.0.0',
        '@types/react-dom': '^18.0.0',
        "html-webpack-plugin": "^5.5.3",
      },
      dependencies: {
        react: '^18.0.0',
        'react-dom': '^18.0.0',
        '@teachfloor/extension-kit': `^${process.env.EXTENSION_KIT_VERSION || '1.0.3'}`,
      },
      babel: {
        presets: [
          "@babel/preset-env",
          "@babel/preset-react"
        ],
      },
    }, null, 2),

    /**
     * public/index.html
     */
    [`${rootDir}/public/index.html`]: getIndexHtmlSnippet(app.name, sdkSnippet),

    /**
     * webpack.config.js
     */
    [`${rootDir}/webpack.config.js`]: getWebpackConfigSnippet(),

    [`${rootDir}/tsconfig.json`]: JSON.stringify({
      compilerOptions: {
        target: "ES5",
        lib: ["dom", "es2015"],
        jsx: "react",   // Enable JSX transformation for React
        module: "commonjs",
        moduleResolution: "node",
        strict: true,
        esModuleInterop: true
      },
      include: [
        "src/**/*"
      ]
    }, null, 2),

    /**
     * .vscode
     */
    [`${rootDir}/.vscode/extensions.json`]: JSON.stringify({
      recommendations: ["dbaeumer.vscode-eslint", "esbenp.prettier-vscode"],
    }, null, 2),

    /**
     * .gitignore
     */
    [`${rootDir}/.gitignore`]:
`node_modules/
dist/
.env
    `,

    /**
     * README.md
     */
    [`${rootDir}/README.md`]:
`# ${app.name}

${app.description}
`,
  };

  /**
   * Create folders
   */
  folders.forEach(folder => fs.mkdirSync(folder, { recursive: true }));

  /**
   * Create files
   */
  Object.entries(files).forEach(([filePath, content]) => {
    fs.writeFileSync(filePath, content);
  });
}

export const createSettings = (componentName: string, withExample: boolean): string => {
  const viewsDir = path.join(process.cwd(), 'src', 'views');
  const componentPath = path.join(viewsDir, `${componentName}.jsx`);

  if (!fs.existsSync(viewsDir)) {
    fs.mkdirSync(viewsDir, { recursive: true });
  }

  let content = `
import React from 'react'
import { Container, Text } from '@teachfloor/extension-kit'

const ${componentName} = () => {
  return (
    <Container>
      <Text>${componentName}</Text>
    </Container>
  )
}

export default ${componentName}
  `.trim();

  if (withExample) {
    content = getExampleSettingsViewContent()
  }

  fs.writeFileSync(componentPath, content);

  return componentPath;
}

export const createView = (componentName: string, withExample: boolean): string => {
  const viewsDir = path.join(process.cwd(), 'src', 'views');
  const componentPath = path.join(viewsDir, `${componentName}.jsx`);

  if (!fs.existsSync(viewsDir)) {
    fs.mkdirSync(viewsDir, { recursive: true });
  }

  let content = `
import React from 'react'
import { Container, Text } from '@teachfloor/extension-kit'

const ${componentName} = () => {
  return (
    <Container>
      <Text>${componentName}</Text>
    </Container>
  )
}

export default ${componentName}
  `.trim();

  if (withExample) {
    content = getExampleViewContent()
  }

  fs.writeFileSync(componentPath, content);

  return componentPath;
}
