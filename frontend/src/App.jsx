import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// IMPORT KOMPONEN UI
import Navbar from "./components/Navbar";

// IMPORT HALAMAN UTAMA
import Dashboard from "./pages/Dashboard";         
import EventDetail from "./pages/EventDetail";     

// IMPORT HALAMAN AUTH
import Login from "./pages/Login";
import Register from "./pages/Register";

// IMPORT HALAMAN ORGANISASI
import MyOrganization from "./pages/org/MyOrganization"; 
import ManageEvent from "./pages/org/ManageEvent"; 

// IMPORT HALAMAN ADMIN
import AdminDashboard from "./pages/admin/AdminDashboard"; 

function App() {
  return (
    <Router>
      <Navbar /> 
      
      <div style={{ marginTop: "20px" }}> 
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/event/:id" element={<EventDetail />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Organization Routes */}
          <Route path="/org" element={<MyOrganization />} /> 
          <Route path="/org/event/:eventID/manage" element={<ManageEvent />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />

          {/* Fallback (404) */}
          <Route path="*" element={<div style={{padding:40, textAlign:"center"}}><h2>404 Not Found</h2></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;