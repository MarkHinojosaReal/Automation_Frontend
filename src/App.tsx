import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { LoadingSpinner } from './components/LoadingSpinner'

const IndexPage = lazy(() => import('./pages/index'))
const LoginPage = lazy(() => import('./pages/login'))
const ProjectsPage = lazy(() => import('./pages/projects'))
const MetricsPage = lazy(() => import('./pages/metrics'))
const AutomationsPage = lazy(() => import('./pages/automations'))
const RequestPage = lazy(() => import('./pages/request'))
const ToolsPage = lazy(() => import('./pages/tools'))
const NotFoundPage = lazy(() => import('./pages/404'))

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading..." />}>
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
    </Suspense>
  )
}
