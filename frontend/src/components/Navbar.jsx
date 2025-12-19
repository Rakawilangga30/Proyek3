import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();
    // Cek apakah user sudah login (token ada di localStorage)
    const token = localStorage.getItem("token");

    const handleLogout = () => {
        const confirm = window.confirm("Yakin ingin logout?");
        if (confirm) {
            localStorage.removeItem("token");
            localStorage.removeItem("user_id");
            alert("Logout berhasil!");
            navigate("/login");
            window.location.reload(); // Refresh agar navbar update
        }
    };

    return (
        <nav style={{ 
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "15px 30px", background: "#2d3748", color: "white", boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
        }}>
            {/* LOGO / BRAND */}
            <div style={{ fontSize: "1.5em", fontWeight: "bold" }}>
                <Link to="/" style={{ color: "white", textDecoration: "none" }}>🚀 LearningApp</Link>
            </div>

            {/* MENU TENGAH */}
            <div style={{ display: "flex", gap: "20px" }}>
                <Link to="/" style={linkStyle}>🏠 Home</Link>
                
                {/* Menu Creator hanya muncul jika login */}
                {token && (
                    <Link to="/org" style={linkStyle}>🏢 Creator Dashboard</Link>
                )}
            </div>

            {/* TOMBOL KANAN (LOGIN / LOGOUT) */}
            <div>
                {token ? (
                    <button 
                        onClick={handleLogout}
                        style={{ 
                            background: "#e53e3e", color: "white", border: "none", 
                            padding: "8px 15px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold"
                        }}
                    >
                        Logout
                    </button>
                ) : (
                    <div style={{ display: "flex", gap: "10px" }}>
                        <Link to="/login" style={{ ...buttonLinkStyle, background: "transparent", border: "1px solid white" }}>Login</Link>
                        <Link to="/register" style={{ ...buttonLinkStyle, background: "#3182ce" }}>Register</Link>
                    </div>
                )}
            </div>
        </nav>
    );
}

// Style Helper biar rapi
const linkStyle = {
    color: "#e2e8f0",
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "1em",
    transition: "color 0.2s"
};

const buttonLinkStyle = {
    color: "white",
    textDecoration: "none",
    padding: "8px 15px",
    borderRadius: "5px",
    fontWeight: "bold",
    fontSize: "0.9em"
};