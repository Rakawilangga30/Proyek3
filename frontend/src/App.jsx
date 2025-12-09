import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register"; // <--- Import ini
import Dashboard from "./pages/Dashboard";
import EventDetail from "./pages/EventDetail";

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: "15px", background: "#f0f0f0", marginBottom: "20px", borderBottom: "1px solid #ccc" }}>
        <Link to="/" style={{ marginRight: "15px", fontWeight: "bold" }}>🏠 Home</Link>
        <Link to="/login" style={{ marginRight: "15px", fontWeight: "bold" }}>🔑 Login</Link>
        <Link to="/register" style={{ fontWeight: "bold", color: "green" }}>📝 Daftar</Link> {/* Tambah Link Ini */}
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> {/* Tambah Route Ini */}
        <Route path="/event/:id" element={<EventDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;