import React from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import InstagramPage from './pages/InstagramPage'
import UserDetails from './pages/UserDetails'
import InstagramCallback from './components/InstagramCallback'
import InstagramDashboard from './pages/InstagramDashboard'
import OnboardingPage from './pages/OnboardingPage'
import OnboardingSuccessPage from './pages/OnboardingSuccessPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<InstagramPage />} />
          <Route path="/user-details" element={<UserDetails />} />
          <Route path="/auth/instagram/callback" element={<InstagramCallback />} />
          <Route path="/callback" element={<InstagramCallback />} />
          <Route path="/dashboard" element={<InstagramDashboard />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/onboarding/success" element={<OnboardingSuccessPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App