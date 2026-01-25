const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Disable error overlay for development
      webpackConfig.plugins = webpackConfig.plugins.filter(
        plugin => plugin.constructor.name !== 'ReactRefreshPlugin'
      );
      
      // Add custom plugin to suppress specific errors
      webpackConfig.plugins.push(
        new webpack.DefinePlugin({
          'process.env.REACT_APP_SUPPRESS_DEVTOOLS_ERRORS': JSON.stringify('true'),
        })
      );

      // Override the error overlay
      const HtmlWebpackPlugin = webpackConfig.plugins.find(
        plugin => plugin.constructor.name === 'HtmlWebpackPlugin'
      );

      return webpackConfig;
    },
  },
  devServer: {
    client: {
      overlay: false, // Disable error overlay
    },
  },
};
