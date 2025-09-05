import type { GatsbyConfig } from "gatsby"

const config: GatsbyConfig = {
  siteMetadata: {
    title: "YouTrack Dashboard",
    description: "Modern ticketing and reporting UI for YouTrack",
    siteUrl: "https://your-username.github.io/Automation_Frontend",
  },
  graphqlTypegen: true,
  plugins: [
    "gatsby-plugin-postcss",
    "gatsby-plugin-image",
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "images",
        path: "./src/images/",
      },
    },
  ],
  pathPrefix: "/Automation_Frontend",
}

export default config
