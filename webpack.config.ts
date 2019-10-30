import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

import webpack from 'webpack';
import WebpackBar from 'webpackbar';
import merge from 'webpack-merge';

import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCssAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';

const TITLE = '프리코네R 캐릭터 스탯 계산기';
const ORIGINAL_ASSET_COPYRIGHT = 'Cygames와 카카오게임즈';
export default async function configure(env = 'dev'): Promise<webpack.Configuration> {
    const rawPackageJson = await fs.promises.readFile(path.resolve(__dirname, 'package.json'));
    const packageJson = JSON.parse(rawPackageJson.toString());
    const version = packageJson.version;
    const gitVersion = await new Promise((resolve, reject) => {
        childProcess.exec('git rev-parse --short @', (err, stdout) => {
            if (err != null) {
                reject(err);
                return;
            }
            resolve(stdout.toString().trim());
        });
    });

    const isProduction = env === 'prod';
    const baseConfig = {
        mode: isProduction ? 'production' as 'production' : 'development' as 'development',
        entry: {
            app: path.resolve(__dirname, 'src/index.tsx'),
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: isProduction ? '[name].[hash].js' : '[name].js',
            chunkFilename: isProduction ? '[id].[hash].js' : '[id].js',
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    exclude: /node_modules/,
                    use: [
                        'babel-loader',
                        'astroturf/loader',
                        'ts-loader',
                    ],
                },
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    use: [
                        'babel-loader',
                        'astroturf/loader',
                    ],
                },
                {
                    test: /\.css$/,
                    use: [
                        isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                modules: true,
                                importLoaders: 1,
                            },
                        },
                        'postcss-loader',
                    ],
                },
                {
                    test: /\.gql$/,
                    use: 'graphql-tag/loader',
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.jsx', '.js'],
        },
        plugins: [
            new webpack.DefinePlugin({
                GQL_ENDPOINT: JSON.stringify(process.env.GQL_ENDPOINT || '//localhost:8000/graphql'),
                STATIC_BASE_URL: JSON.stringify(process.env.STATIC_BASE_URL || 'https://ames-static.tirr.dev/'),
                VERSION: JSON.stringify(`${version}-git.${gitVersion}${env === 'prod' ? '' : '.' + env}`),
                REPOSITORY_URL: JSON.stringify(packageJson.repository),
                TITLE: JSON.stringify(TITLE),
                ORIGINAL_ASSET_COPYRIGHT: JSON.stringify(ORIGINAL_ASSET_COPYRIGHT),
            }),
            new CleanWebpackPlugin(),
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, 'src/index.html'),
                title: TITLE,
                description: '캐릭터 능력치를 계산하고 비교해 보세요.',
                meta: {
                    viewport: 'width=device-width, initial-scale=1, shrink-to-fit=no',
                },
            }),
            new WebpackBar(),
        ],
        stats: {
            all: false,
            assets: true,
            assetsSort: 'id',
            errors: true,
            errorDetails: true,
            hash: true,
            moduleTrace: true,
            version: true,
            warnings: true,
            warningsFilter: 'size limit',
        },
        devtool: isProduction ? 'hidden-source-map' as 'hidden-source-map' : 'inline-source-map' as 'inline-source-map',
    };

    let overrideConfig;
    if (isProduction) {
        overrideConfig = {
            plugins: [
                new MiniCssExtractPlugin({
                    filename: '[name].[hash].css',
                    chunkFilename: '[id].[hash].css',
                }),
            ],
            optimization: {
                minimizer: [
                    new TerserPlugin({
                        parallel: true,
                        sourceMap: true,
                    }),
                    new OptimizeCssAssetsPlugin({
                        cssProcessorOptions: {
                            map: {
                                inline: false,
                                annotation: false,
                            },
                        },
                    }),
                ],
            },
            stats: {
                assetsSort: '!size',
                performance: true,
            },
        };
    } else {
        overrideConfig = {
            plugins: [
                new webpack.HotModuleReplacementPlugin(),
            ],
            devServer: {
                contentBase: path.resolve(__dirname, 'dist'),
                compress: true,
                port: 3000,
                hot: true,
                stats: baseConfig.stats,
            },
        };
    }

    return merge(baseConfig, overrideConfig);
};
