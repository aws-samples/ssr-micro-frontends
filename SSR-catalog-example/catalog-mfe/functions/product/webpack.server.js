const path = require("path");

module.exports = {
  entry: "./app.js",
  target: "node",
  output: {
    path: path.resolve("server-build"),
    filename: "app.js",
    libraryTarget: "commonjs"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader",
      }
    ],
  },
};