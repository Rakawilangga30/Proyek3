import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user"); // Default user biasa
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            // Sesuaikan endpoint ini dengan Backend Anda (biasanya /register)
            await api.post("/register", { name, email, password, role });
            
            alert("Registrasi Berhasil! Silakan Login.");
            navigate("/login");
        } catch (error) {
            alert("Registrasi Gagal: " + (error.response?.data?.error || "Error"));
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "50px auto", padding: "30px", border: "1px solid #ddd", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)" }}>
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>📝 Daftar Akun</h2>
            <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <input 
                    type="text" placeholder="Nama Lengkap" required 
                    value={name} onChange={e => setName(e.target.value)}
                    style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                />
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
                
                {/* Pilihan Role (Opsional, jika backend mendukung) */}
                <select 
                    value={role} onChange={e => setRole(e.target.value)}
                    style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
                >
                    <option value="user">Pengguna (Siswa)</option>
                    <option value="organizer">Organizer (Pembuat Event)</option>
                </select>

                <button type="submit" style={{ padding: "10px", background: "#48bb78", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
                    Daftar Sekarang
                </button>
            </form>
            <p style={{ textAlign: "center", marginTop: "15px", fontSize: "0.9em" }}>
                Sudah punya akun? <Link to="/login" style={{ color: "#3182ce" }}>Login disini</Link>
            </p>
        </div>
    );
}