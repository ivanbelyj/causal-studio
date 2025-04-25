module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: "./src/js/main/main.js",
  devtool: "source-map",
  module: {
    rules: require("./webpack.rules"),
  }
};
