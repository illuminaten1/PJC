module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Ajout du loader MDX
      webpackConfig.module.rules.push({
        test: /\.mdx?$/,
        use: [
          {
            loader: '@mdx-js/loader',
            options: {}
          }
        ]
      });
      
      return webpackConfig;
    }
  }
};