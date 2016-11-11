// Exporting the module so that it can be used by webpack-dev-server as config file

module.exports = {
    // Entry point for the application
    entry: [
        './src/index.js'
    ],
    output: {
        // The compiled and minified file will be saved in the current directory and named
        // as bundle.js. Which will then be used in index.html
        path: __dirname,
        publicPath: '/',
        filename: 'WFSEdit.js'
    },
    resolve: {
        extensions: ['', '.js']
    },
    devServer: {
        // 404 pages will fall back to ./ that means index.html
        historyApiFallback: true,
        contentBase: './',
        // Inline true indicates server will refresh if we make any changes to any of the .js files
        inline: true,
        // port 3000 will be used to publish the app locally so the app can be accessed by
        // hitting the url http://localhost:3000
        port: 3000
    },
}
