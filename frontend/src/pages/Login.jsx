import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    // ... imports

        const handleLogin = async (e) => {
            e.preventDefault();
            try {
                const res = await api.post("/login", { email, password });
                
                // --- PERBAIKAN DI SINI ---
                
                // 1. Ambil raw roles dari backend
                const rawRoles = res.data.roles || [];

                // 2. Format menjadi Array String Murni dan normalisasi
                // Kita jaga-jaga: kalau formatnya object kita ambil .name, kalau string ya biarkan string
                // Normalisasi: uppercase + trim, dan map 'ORGANIZATION' -> 'ORGANIZER'
                let formattedRoles = rawRoles.map(r => {
                    if (typeof r === 'object') {
                        return (r.name || r.Name || "").toString();
                    }
                    return String(r || "");
                })
                .map(r => r.toUpperCase().trim())
                .map(r => r === "ORGANIZATION" ? "ORGANIZER" : r);

            // 3. Simpan User + Roles yang sudah bersih
            const userData = {
                ...res.data.user,
                roles: formattedRoles // Simpan versi string, contoh: ["USER", "ORGANIZER"]
            };
            
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(userData));
                // --- END PERBAIKAN ---

                alert("Login Berhasil!");

                // Logic Redirect tetap sama...
                if (formattedRoles.includes("ADMIN")) { // Gunakan formattedRoles untuk cek di sini juga
                    navigate("/dashboard/admin/users");
                } else if (formattedRoles.includes("ORGANIZER")) {
                    navigate("/dashboard/org/events"); // Arahkan ke list event
                } else {
                    navigate("/dashboard/my-courses");
                }

                setTimeout(() => { window.location.reload() }, 100); 

            } catch (error) {
                console.error(error);
                alert("Login Gagal: " + (error.response?.data?.error || "Cek Email/Password"));
            }
        };

    return (
        <div style={{ maxWidth: "400px", margin: "100px auto", padding: "30px", background:"white", border: "1px solid #ddd", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <h2 style={{ textAlign: "center", marginBottom: "20px", color:"#2d3748" }}>🔐 Masuk Akun</h2>
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <input 
                    type="email" placeholder="Email" required 
                    value={email} onChange={e => setEmail(e.target.value)}
                    style={{ padding: "12px", borderRadius: "6px", border: "1px solid #cbd5e0" }}
                />
                <input 
                    type="password" placeholder="Password" required 
                    value={password} onChange={e => setPassword(e.target.value)}
                    style={{ padding: "12px", borderRadius: "6px", border: "1px solid #cbd5e0" }}
                />
                <button type="submit" style={{ padding: "12px", background: "#3182ce", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize:"16px" }}>
                    Masuk
                </button>
            </form>
            <p style={{ textAlign: "center", marginTop: "20px", fontSize: "0.9em", color:"#718096" }}>
                Belum punya akun? <Link to="/register" style={{ color: "#3182ce", fontWeight:"bold" }}>Daftar disini</Link>
            </p>
        </div>
    );
}