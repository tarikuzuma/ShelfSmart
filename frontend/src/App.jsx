import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from '../pages/LandingPage'
import VendorDashboard from '../pages/Home/VendorDashboard'
import RetailerDashboard from '../pages/Retailer/Dashboard'
import AddProduct from '../pages/Retailer/AddProduct'
import DemandForecast from '../pages/Retailer/DemandForecast'
import Marketplace from '../pages/Marketplace/Marketplace'
import ProductPage from '../pages/Product/ProductPage'
import Signup from '../pages/Signup'
import Login from '../pages/Login'
import { Toaster } from '@/components/ui/toast'

function App() {
  return (
    <Router>
      <Toaster />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/retailer/dashboard" element={<VendorDashboard />} />
        <Route path="/retailer/products" element={<RetailerDashboard />} />
        <Route path="/retailer/add-product" element={<AddProduct />} />
        <Route path="/retailer/demand-forecast" element={<DemandForecast />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/product/:id" element={<ProductPage />} />
      </Routes>
    </Router>
  )
}

export default App
