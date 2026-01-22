import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from '../pages/LandingPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<div className="p-8">Dashboard - Coming Soon</div>} />
        <Route path="/marketplace" element={<div className="p-8">Marketplace - Coming Soon</div>} />
      </Routes>
    </Router>
  )
}

export default App
