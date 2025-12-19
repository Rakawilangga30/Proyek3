import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// IMPORT KOMPONEN UI
import Navbar from "./components/Navbar";

// IMPORT HALAMAN UTAMA
import Dashboard from "./pages/Dashboard";         
import EventDetail from "./pages/EventDetail";     
import MyOrganization from "./pages/org/MyOrganization"; 
import ManageEvent from "./pages/org/ManageEvent"; 

// IMPORT HALAMAN AUTH (YANG BARU DIBUAT)
import Login from "./pages/Login";       // <--- INI PENTING
import Register from "./pages/Register"; // <--- INI PENTING

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

          {/* Auth Routes (Login & Register) */}
          <Route path="/login" element={<Login />} />       {/* <--- Route Login */}
          <Route path="/register" element={<Register />} /> {/* <--- Route Register */}

          {/* Organization Routes */}
          <Route path="/org" element={<MyOrganization />} /> 
          <Route path="/org/event/:eventID/manage" element={<ManageEvent />} />

          {/* Fallback */}
          <Route path="*" element={<div style={{padding:40, textAlign:"center"}}><h2>404 Not Found</h2></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;