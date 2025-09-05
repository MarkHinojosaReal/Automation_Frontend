import type { GatsbyConfig } from "gatsby"

const config: GatsbyConfig = {
  siteMetadata: {
    title: "YouTrack Automation Dashboard",
    description: "Modern automation request and reporting UI for YouTrack with Ocean Breeze design",
    siteUrl: "https://MarkHinojosaReal.github.io/Automation_Frontend",
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
