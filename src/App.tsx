import React from 'react'
import { Routes, Route } from 'react-router-dom'
import IndexPage from './pages/index'
import LoginPage from './pages/login'
import ProjectsPage from './pages/projects'
import MetricsPage from './pages/metrics'
import AutomationsPage from './pages/automations'
import RequestPage from './pages/request'
import ToolsPage from './pages/tools'
import NotFoundPage from './pages/404'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<IndexPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/metrics" element={<MetricsPage />} />
      <Route path="/automations" element={<AutomationsPage />} />
      <Route path="/request" element={<RequestPage />} />
      <Route path="/tools" element={<ToolsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
