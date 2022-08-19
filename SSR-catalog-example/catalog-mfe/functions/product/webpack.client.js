const path = require("path");

module.exports = {
    entry: "./src/Client.js",
    output: {
        path: path.join(__dirname, "client-build"),
        filename: "buy.js"
    },
    externals: {
        preact: "preact",
        htm: "htm"
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