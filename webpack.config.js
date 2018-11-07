module.exports = {
  module: {
    loaders: [
      // support local package.json browserify config
      {
        test: /\.js$/,
        loader: 'ify-loader',
        enforce: 'post'
      }
    ]
  }
}