const fs = require('fs');
const _path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { DefinePlugin, ProvidePlugin } = require('webpack');
const timestamp = new Date().getTime();
const isDevServer = process.env.WEBPACK_SERVE;
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const envData = require('./env.js');
const { info: logInfo } = console;

module.exports = (env, argv) => {
    const {
        fronts,
        enableOnly = null,
        disableOnly = null,
        httpsKey = null,
        httpsCert = null,
        buildGzipFiles = false,
        nonce = null,
    } = envData;

    const cliEnableOnly = env.enable?.split(',') || env.only?.split(',') || null;
    const cliDisableOnly = env.disable?.split(',');

    const configs = Object.keys(fronts)
        .filter((key) => !(cliEnableOnly || enableOnly) || (cliEnableOnly || enableOnly).includes(key))
        .filter((key) => !(cliDisableOnly || disableOnly) || !(cliDisableOnly || disableOnly).includes(key))
        .map((key) => ({ out: key, ...fronts[key] }));

    logInfo(`Building fronts:\n${configs?.map((config) => `   - ${config?.out}`)?.join('\n')}\n`);

    const { mode = 'development' } = argv;
    const distPath = 'dist';
    const scriptPath = `app-${timestamp}.js`;

    const entry = configs.reduce((entry, item) => {
        return { ...entry, [item.out]: ['@babel/polyfill', `./index-${item.type}.js`] };
    }, {});

    const outPlugins = configs
        .map((item) => {
            const webRoot = item?.webRoot ? `/${item?.webRoot.replace(/^\/+/, '')}` : '';
            const webPath = (path) => {
                return isDevServer ? `/${item.out}${path}` : `${webRoot}${path}`;
            };

            return item.withoutHtml
                ? null
                : new HtmlWebpackPlugin({
                      template: `../../react/public/index.ejs`,
                      templateParameters: {
                          title: item.default_title || 'Forus',
                          type: item.client_type,
                          timestamp: timestamp,
                          script: webPath(`/${scriptPath}`),
                          base: webPath(`/`),
                          webPath: webPath,
                          favicon: webPath(`/assets/img/favicon.ico`),
                          disable_indexing: item.config?.disable_indexing,
                          env_data: {
                              ...item,
                              client_key: item.client_key_api || item.client_key,
                              client_skin: item.client_key,
                              webRoot: (isDevServer ? item.out : webRoot).replace(/^\/+/, ''),
                          },
                      },
                      filename: item.out + '/index.html',
                      inject: false,
                  });
        })
        .filter((i) => i !== null);

    const resolvePath = (path) => {
        return _path.resolve(__dirname, path);
    };

    const copyPlugins = configs.map((item) => {
        const isDashboard = ['sponsor', 'provider', 'validator'].includes(item.client_type);
        const platform = isDashboard
            ? 'platform'
            : item.client_type === 'website'
              ? 'website'
              : item.type === 'backend'
                ? 'backend'
                : 'webshop';
        const assetPath = item.assetsPath || `${distPath}/${item.out}/assets`;

        return new CopyPlugin({
            patterns: [
                {
                    context: `../assets/forus-${platform}/resources/_${platform}-common/assets`,
                    from: `**/**.*`,
                    to: resolvePath(assetPath),
                    noErrorOnMissing: true,
                },
                {
                    context: `../assets/forus-${platform}/resources/${platform}-${item.client_key}/assets`,
                    from: `**/**.*`,
                    to: resolvePath(assetPath),
                    noErrorOnMissing: true,
                    force: true,
                },
                {
                    from: resolvePath(`./node_modules/@mdi/font/fonts`),
                    to: resolvePath(`${assetPath}/dist/fonts`),
                },
                {
                    from: resolvePath(`./node_modules/@mdi/font/css/materialdesignicons.min.css`),
                    to: resolvePath(`${assetPath}/dist/css/materialdesignicons.min.css`),
                },
                {
                    from: resolvePath(`./node_modules/summernote/dist/summernote-lite.min.js`),
                    to: resolvePath(`${assetPath}/dist/js/summernote.${timestamp}.min.js`),
                },
                {
                    from: resolvePath(`./node_modules/summernote/dist/summernote-lite.min.css`),
                    to: resolvePath(`${assetPath}/dist/js/summernote.${timestamp}.min.css`),
                },
                {
                    from: resolvePath(`./node_modules/jquery/dist/jquery.min.js`),
                    to: resolvePath(`${assetPath}/dist/js/jquery.${timestamp}.min.js`),
                },
            ],
        });
    });

    return {
        mode: mode,
        context: resolvePath('react/src'),

        devServer: {
            static: {
                directory: resolvePath(`${distPath}`),
            },
            devMiddleware: {
                writeToDisk: true,
            },
            historyApiFallback: true,
            compress: true,
            allowedHosts: 'all',
            client: {
                overlay: false,
            },
            server:
                httpsKey && httpsCert
                    ? {
                          type: 'https',
                          options: {
                              key: fs.readFileSync(httpsKey),
                              cert: fs.readFileSync(httpsCert),
                          },
                      }
                    : undefined,
            port: 5000,
        },

        entry: entry,

        output: {
            path: resolvePath(distPath),
            publicPath: '/',
            filename: (pathData) => {
                return fronts[pathData.chunk.name]?.appFileName || `[name]/${scriptPath}`;
            },
        },

        resolve: {
            extensions: ['.ts', '.js', '.jsx', '.tsx'],
        },

        module: {
            rules: [
                {
                    test: /\.(ts|tsx)$/i,
                    loader: 'ts-loader',
                    exclude: /node_modules/,
                },
                /* {
                    test: /\.html$/i,
                    loader: 'html-loader',
                }, */
                {
                    test: /\.css$/i,
                    use: [
                        {
                            loader: 'style-loader',
                            options: {
                                attributes: nonce ? { nonce } : undefined,
                            },
                        },
                        'css-loader',
                    ],
                },
                {
                    test: /\.(png|jpe?g|gif)$/i,
                    type: 'asset/resource',
                },
                {
                    test: /\.svg$/i,
                    issuer: /\.[jt]sx?$/,
                    use: [{ loader: '@svgr/webpack', options: { svgo: false } }],
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        // MiniCssExtractPlugin.loader,
                        // Creates `style` nodes from JS strings
                        {
                            loader: 'style-loader',
                            options: {
                                esModule: true /*, injectType: 'linkTag'*/,
                                attributes: nonce ? { nonce } : undefined,
                            },
                        },
                        // Translates CSS into CommonJS
                        { loader: 'css-loader', options: { url: false, sourceMap: true } },
                        /*{
                            loader: 'resolve-url-loader',
                            options: { webpackImporter: false },
                        },*/
                        {
                            // Compiles Sass to CSS
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true,
                                implementation: require('sass'),
                                additionalData: '$buildReact: true;',
                                webpackImporter: true,
                                warnRuleAsWarning: false,
                                sassOptions: { quietDeps: true },
                            },
                        },
                    ],
                },
                {
                    test: /\.m?(js|jsx)$/,
                    exclude: /(node_modules|bower_components)/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
                            plugins: [
                                '@babel/plugin-syntax-jsx',
                                '@babel/plugin-transform-react-jsx',
                                '@babel/plugin-transform-flow-strip-types',
                                'syntax-trailing-function-commas',
                                ['@babel/plugin-transform-template-literals', { loose: true }],
                                '@babel/plugin-transform-literals',
                                '@babel/plugin-transform-arrow-functions',
                                '@babel/plugin-transform-block-scoped-functions',
                                '@babel/plugin-transform-object-super',
                                '@babel/plugin-transform-shorthand-properties',
                                '@babel/plugin-transform-computed-properties',
                                '@babel/plugin-transform-for-of',
                                ['@babel/plugin-transform-spread', { loose: true, useBuiltIns: true }],
                                '@babel/plugin-transform-parameters',
                                ['@babel/plugin-transform-destructuring', { loose: true, useBuiltIns: true }],
                            ],
                        },
                    },
                },
            ],
        },

        plugins: [
            ...outPlugins,
            new CleanWebpackPlugin(),
            ...copyPlugins,
            buildGzipFiles ? new CompressionPlugin({ algorithm: 'gzip', test: /\.js(\?.*)?$/i }) : null,
            new DefinePlugin({ __REACT_DEVTOOLS_GLOBAL_HOOK__: '({ isDisabled: true })' }),
            new ProvidePlugin({ React: 'react' }),
            new ESLintPlugin({
                extensions: ['js', 'mjs', 'jsx', 'ts', 'tsx'],
                eslintPath: require.resolve('eslint'),
                failOnError: true,
                failOnWarning: true,
                cache: true,
                resolvePluginsRelativeTo: __dirname,
            }),
        ].filter((plugin) => plugin),

        optimization: {
            minimize: mode !== 'development',
            minimizer: [new TerserPlugin({ extractComments: false })],
        },

        devtool: mode === 'development' ? 'eval-source-map' : false,
    };
};
