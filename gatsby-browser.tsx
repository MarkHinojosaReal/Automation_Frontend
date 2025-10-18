import React from "react"
import { AuthProvider } from "./src/contexts/AuthContext"
import "./src/styles/global.css"

// Wrap entire app with AuthProvider
export const wrapRootElement = ({ element }: { element: React.ReactNode }) => {
  return <AuthProvider>{element}</AuthProvider>
}
