import React from "react"
import type { GatsbySSR } from "gatsby"
import { AuthProvider } from "./src/contexts/AuthContext"

export const wrapRootElement = ({ element }: { element: React.ReactNode }) => {
  return <AuthProvider>{element}</AuthProvider>
}

export const onRenderBody: GatsbySSR["onRenderBody"] = ({ setHtmlAttributes, setHeadComponents }) => {
  setHtmlAttributes({ lang: "en" })
  
  setHeadComponents([
    <meta
      key="viewport"
      name="viewport"
      content="width=device-width, initial-scale=1.0, viewport-fit=cover"
    />,
    <meta
      key="mobile-web-app-capable"
      name="mobile-web-app-capable"
      content="yes"
    />,
    <meta
      key="apple-mobile-web-app-capable"
      name="apple-mobile-web-app-capable"
      content="yes"
    />,
    <meta
      key="apple-mobile-web-app-status-bar-style"
      name="apple-mobile-web-app-status-bar-style"
      content="default"
    />,
  ])
}