import React from 'react'
import {HashRouter as Router, Routes, Route, Navigate} from 'react-router-dom'
import InstagramPage from './pages/InstagramPage'
import InstagramCallback from './components/InstagramCallback'
import InstagramTokenTest from './pages/InstagramTokenTest'
import WebhookPage from './pages/WebhookPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<InstagramPage />} />
          {/* ✅ UPDATED: Keep the auth callback route */}
          <Route path="/auth/instagram/callback" element={<InstagramCallback />} />
          <Route path="/token-test" element={<InstagramTokenTest />} />
          <Route path="/webhook-setup" element={<WebhookPage />} />
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App