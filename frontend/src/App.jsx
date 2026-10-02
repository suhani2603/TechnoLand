import React, { Suspense, lazy } from 'react'
import useMapStore from './store/mapStore.js'

const LandingPage = lazy(() => import('./components/landing/LandingPage.jsx'))
const AppShell    = lazy(() => import('./components/layout/AppShell.jsx'))

function AppLoader() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#0f1923', color: '#4ade80', gap: 12,
    }}>
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#16a34a" />
        <path d="M8 22 L16 10 L24 22 Z" fill="white" opacity="0.9" />
        <circle cx="16" cy="16" r="3" fill="#86efac" />
      </svg>
      <span style={{ fontSize: 14, fontFamily: 'system-ui,sans-serif', opacity: 0.7 }}>
        Loading TechnoLand…
      </span>
    </div>
  )
}

export default function App() {
  const appState = useMapStore((s) => s.appState)

  return (
    <Suspense fallback={<AppLoader />}>
      {appState === 'landing' ? <LandingPage /> : <AppShell />}
    </Suspense>
  )
}
