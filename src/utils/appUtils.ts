import * as fs from 'fs'

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
        })(window, document, 'https://${process.env.API_URL || 'app.teachfloor.com'}/apps/', '.js?ver=')
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
  plugins: [
    new HtmlWebpackPlugin({
      template: 'public/index.html', // Path to your template
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
};`
)

const getExampleViewSnippet = () => (
`import React, { useEffect } from 'react';
import { Container, Text } from '@teachfloor/extension-kit'

const App = () => {
  useEffect(() => {
    tf('onInit', function (API) {
      API.on('environment.viewport.changed', (viewport, objectContext) => {
        console.log('SDK from CLI viewport', viewport, objectContext)
      });
    })
  },[])

  return (
    <Container>
      <Text>Welcome to Hello World!</Text>
    </Container>
  );
};

export default App;
`
)

export const createAppStructure = (rootDir: string, appId: string, appName: string, description: string, version: string) => {
  /**
   * TODO - Get the SDK snippet from api
   */
  const sdkSnippet = getSDKSnippet('674b222f3a113')

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
    [`${rootDir}/src/index.js`]: `import React from 'react';
import ReactDOM from 'react-dom';
import App from './views/App';

ReactDOM.render(<App />, document.getElementById('root'));
    `,

    /**
     * View example
     */
    [`${rootDir}/src/views/App.jsx`]: getExampleViewSnippet(),

    // [`${rootDir}/src/views/App.test.tsx`]: `
    //   import { render } from '@testing-library/react';
    //   import App from './App';

    //   test('renders welcome message', () => {
    //     const { getByText } = render(<App />);
    //     expect(getByText(/Welcome to ${appName}/i)).toBeInTheDocument();
    //   });
    // `,

    /**
     * App manifest
     */
    [`${rootDir}/teachfloor-app.json`]: JSON.stringify({
      id: appId,
      version,
      name: appName,
      description,
    }, null, 2),

    /**
     * App package.json
     */
    [`${rootDir}/package.json`]: JSON.stringify({
      name: appName,
      version: version,
      description: description,
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
    [`${rootDir}/public/index.html`]: getIndexHtmlSnippet(appName, sdkSnippet),

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
`# ${appName}

${description}
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
