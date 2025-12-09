import { useState } from "react";
import api from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            // Request ke Backend: POST /api/register
            await api.post("/register", { name, email, password });
            
            alert("Registrasi Berhasil! Silakan Login.");
            // Pindah ke halaman Login setelah sukses
            navigate("/login");
        } catch (error) {
            alert("Registrasi Gagal: " + (error.response?.data?.error || "Error"));
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto", marginTop: "50px", border: "1px solid #ddd", borderRadius: "8px" }}>
            <h2>Daftar Akun Baru</h2>
            <form onSubmit={handleRegister}>
                <div style={{ marginBottom: "10px" }}>
                    <label>Nama Lengkap</label>
                    <input 
                        type="text" required
                        value={name} onChange={(e) => setName(e.target.value)} 
                        style={{ display: "block", width: "100%", padding: "8px", marginTop: "5px" }}
                    />
                </div>
                <div style={{ marginBottom: "10px" }}>
                    <label>Email</label>
                    <input 
                        type="email" required
                        value={email} onChange={(e) => setEmail(e.target.value)} 
                        style={{ display: "block", width: "100%", padding: "8px", marginTop: "5px" }}
                    />
                </div>
                <div style={{ marginBottom: "15px" }}>
                    <label>Password</label>
                    <input 
                        type="password" required
                        value={password} onChange={(e) => setPassword(e.target.value)} 
                        style={{ display: "block", width: "100%", padding: "8px", marginTop: "5px" }}
                    />
                </div>
                <button type="submit" style={{ width: "100%", padding: "10px", background: "#3182ce", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                    Daftar Sekarang
                </button>
            </form>
            <p style={{ marginTop: "15px", textAlign: "center" }}>
                Sudah punya akun? <Link to="/login" style={{ color: "blue" }}>Login di sini</Link>
            </p>
        </div>
    );
}