import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Sesuaikan endpoint ini dengan Backend Anda (biasanya /login)
            const res = await api.post("/login", { email, password });
            
            // Simpan Token & User ID
            localStorage.setItem("token", res.data.token);
            // Jika backend mengirim user_id, simpan juga (opsional)
            // localStorage.setItem("user_id", res.data.user_id);

            alert("Login Berhasil!");
            navigate("/"); // Redirect ke Dashboard
            window.location.reload(); // Refresh agar Navbar mendeteksi token
        } catch (error) {
            alert("Login Gagal: " + (error.response?.data?.error || "Cek Email/Password"));
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "50px auto", padding: "30px", border: "1px solid #ddd", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>🔐 Login</h2>
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <input 
                    type="email" placeholder="Email" required 
                    value={email} onChange={e => setEmail(e.target.value)}
                    style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                />
                <input 
                    type="password" placeholder="Password" required 
                    value={password} onChange={e => setPassword(e.target.value)}
                    style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                />
                <button type="submit" style={{ padding: "10px", background: "#3182ce", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
                    Masuk
                </button>
            </form>
            <p style={{ textAlign: "center", marginTop: "15px", fontSize: "0.9em" }}>
                Belum punya akun? <Link to="/register" style={{ color: "#3182ce" }}>Daftar disini</Link>
            </p>
        </div>
    );
}