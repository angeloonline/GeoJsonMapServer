const path = require('path')

module.exports = {
  entry: {
    app: ['./src/public/js/viewMap.js']
  },
  output: {
    path: path.resolve(__dirname, 'dist/public/js/'),
    filename: 'app.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['@babel/preset-env']
        }
      }
    ]
  }
}