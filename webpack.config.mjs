import fs from 'fs';
import lodash from 'lodash';

import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CompressionPlugin from 'compression-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';
import webpack from 'webpack';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { DefinePlugin, ProvidePlugin } = webpack;

const { set } = lodash;
const envData = require('./env.js');
const timestamp = new Date().getTime();
const isDevServer = process.env.WEBPACK_SERVE;
const { info: logInfo } = console;

// noinspection JSUnusedGlobalSymbols
export default (env = {}, argv = {}) => {
    const {
        fronts,
        enableOnly = null,
        disableOnly = null,
        httpsCA = null,
        httpsKey = null,
        httpsCert = null,
        buildGzipFiles = false,
        nonce = null,
        globalConfigs = {},
    } = envData;

    // example: npm run start -- --env enable='webshop'
    // example: npm run start -- --env disable='dashboard*'
    const cliEnableOnly = env.enable?.split(',') || env.only?.split(',') || null;
    const cliDisableOnly = env.disable?.split(',');

    const filterKey = (key, list, exclude = false) => {
        if (!list) {
            return !exclude;
        }

        return list.some((item) => {
            return new RegExp(`^${item.replace(/\*/g, '.*')}$`).test(key);
        });
    };

    const configs = Object.keys(fronts)
        .filter((key) => filterKey(key, cliEnableOnly || enableOnly))
        .filter((key) => !filterKey(key, cliDisableOnly || disableOnly, true))
        .map((key) => ({ out: key, ...fronts[key] }))
        .map((config) => {
            Object.keys(globalConfigs).forEach((group) => {
                if (new RegExp(`^${group.replace(/\*/g, '.*')}$`).test(config.out)) {
                    Object.keys(globalConfigs[group]).forEach((key2) => {
                        set(config, key2, globalConfigs[group][key2]);
                    });
                }
            });

            return config;
        });

    logInfo(`Building fronts:\n${configs?.map((config) => `   - ${config?.out}`)?.join('\n')}\n`);

    const { mode = 'development' } = argv;
    const distPath = 'dist';
    const scriptPath = `app-${timestamp}.js`;

    const entry = configs.reduce((entry, item) => {
        return { ...entry, [item.out]: `./index-${item.type}.tsx` };
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

    const resolvePath = (relativePath) => {
        return path.resolve(__dirname, relativePath);
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
                {
                    from: resolvePath(`./node_modules/pdfjs-dist/build/pdf.min.mjs`),
                    to: resolvePath(`${assetPath}/dist/js/pdf.${timestamp}.min.js`),
                },
                {
                    from: resolvePath(`./node_modules/pdfjs-dist/build/pdf.worker.min.mjs`),
                    to: resolvePath(`${assetPath}/dist/js/pdf.worker.${timestamp}.min.js`),
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
                              ca: httpsCA ? fs.readFileSync(httpsCA) : undefined,
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
            extensions: ['.ts', '.tsx', '.js'],
        },

        module: {
            rules: [
                {
                    test: /\.(ts|tsx|js)$/i,
                    loader: 'ts-loader',
                    exclude: /node_modules/,
                    options: {
                        compilerOptions: { noEmit: false },
                    },
                },
                {
                    test: /\.css$/i,
                    use: [
                        { loader: 'style-loader', options: { attributes: nonce ? { nonce } : undefined } },
                        'css-loader',
                    ],
                },
                {
                    test: /\.(png|jpe?g|gif)$/i,
                    type: 'asset/resource',
                },
                {
                    test: /\.svg$/i,
                    oneOf: [
                        {
                            issuer: /\.[jt]sx?$/,
                            use: [{ loader: '@svgr/webpack', options: { svgo: false } }],
                        },
                        {
                            type: 'asset/resource',
                        },
                    ],
                },
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        {
                            loader: 'style-loader',
                            options: {
                                attributes: nonce ? { nonce } : undefined,
                                esModule: true,
                            },
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true,
                                url: false,
                            },
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                api: 'modern',
                                sourceMap: true,
                            },
                        },
                    ],
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
                extensions: ['js', 'mjs', 'ts', 'tsx'],
                eslintPath: require.resolve('eslint'),
                failOnError: true,
                failOnWarning: true,
                cache: true,
            }),
        ].filter((plugin) => plugin),

        optimization: {
            minimize: mode !== 'development',
            minimizer: [new TerserPlugin({ extractComments: false })],
        },

        performance: {
            hints: mode === 'development' ? false : 'warning',
            maxEntrypointSize: 3 * 1024 * 1024,
            maxAssetSize: 3 * 1024 * 1024,
        },

        devtool: mode === 'development' ? 'eval-source-map' : false,

        // https://github.com/Hacker0x01/react-datepicker/issues/6181
        ignoreWarnings: [
            (w) =>
                w.message?.includes('Critical dependency: the request of a dependency is an expression') &&
                /react-datepicker[/\\]dist[/\\]index\.es\.js/.test(w.module?.resource || ''),
        ],
    };
};
