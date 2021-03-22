module.exports = {
  siteMetadata: {
    title: `Orbit`,
    description: `Sales Data Management that Works for your Team`,
    author: `@ryanchenkie`
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`
      }
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `gatsby-starter-default`,
        short_name: `starter`,
        start_url: `/`,
        background_color: `#663399`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/images/favicon.ico`
      }
    },
    `gatsby-plugin-offline`,
    `gatsby-plugin-postcss`,
    {
      resolve: `gatsby-plugin-google-fonts`,
      options: {
        fonts: [`Noto Sans JP\:400,700`],
        display: 'swap'
      }
    }
  ]
};
