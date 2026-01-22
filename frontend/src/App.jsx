import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from '../pages/LandingPage'
import RetailerDashboard from '../pages/Retailer/Dashboard'
import Marketplace from '../pages/Marketplace/Marketplace'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<RetailerDashboard />} />
        <Route path="/marketplace" element={<Marketplace />} />
      </Routes>
    </Router>
  )
}

export default App
