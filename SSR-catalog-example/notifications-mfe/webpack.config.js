const path = require("path");

module.exports = {
    entry: "./src/index.js",
    output: {
        path: path.join(__dirname, "dist"),
        filename: "notifications.js"
    },
    externals: {
        preact: "preact"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader",
            }
        ]
    }
};