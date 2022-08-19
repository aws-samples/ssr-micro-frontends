const path = require("path");

module.exports = {
  watch: true,
  entry: "./GET_Reviews.js",
  target: "node",
  output: {
    path: path.resolve("server-build"),
    filename: "GET_Reviews.js",
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