import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from '../pages/LandingPage'
import VendorDashboard from '../pages/Home/VendorDashboard'
import RetailerDashboard from '../pages/Retailer/Dashboard'
import Marketplace from '../pages/Marketplace/Marketplace'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/retailer/dashboard" element={<VendorDashboard />} />
        <Route path="/retailer/products" element={<RetailerDashboard />} />
        <Route path="/marketplace" element={<Marketplace />} />
      </Routes>
    </Router>
  )
}

export default App
