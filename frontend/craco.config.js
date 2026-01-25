const path = require('path');

module.exports = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  devServer: {
    client: {
      overlay: false, // Disable error overlay to hide React DevTools errors
    },
  },
};
