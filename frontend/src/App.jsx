import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from '../pages/LandingPage'
import Signup from '../pages/Authentication/Signup'
import Login from '../pages/Authentication/Login'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<div className="p-8">Dashboard - Coming Soon</div>} />
        <Route path="/marketplace" element={<div className="p-8">Marketplace - Coming Soon</div>} />
      </Routes>
    </Router>
  )
}

export default App
