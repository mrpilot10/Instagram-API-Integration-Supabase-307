import React from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import InstagramPage from './pages/InstagramPage'
import UserDetails from './pages/UserDetails'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<InstagramPage />} />
          <Route path="/user-details" element={<UserDetails />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App