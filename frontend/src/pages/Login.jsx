import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // Request ke Backend Go: POST /api/login
            const response = await api.post("/login", { email, password });
            
            // Simpan token di LocalStorage
            localStorage.setItem("token", response.data.token);
            alert("Login Berhasil!");
            
            // Pindah ke halaman Dashboard
            navigate("/");
        } catch (error) {
            alert("Login Gagal: " + (error.response?.data?.error || "Error"));
        }
    };

    return (
        <div style={{ padding: "20px", border: "1px solid black", maxWidth: "300px" }}>
            <h2>Login Test</h2>
            <form onSubmit={handleLogin}>
                <input 
                    type="email" placeholder="Email" 
                    value={email} onChange={(e) => setEmail(e.target.value)} 
                    style={{ display: "block", marginBottom: "10px", width: "100%" }}
                />
                <input 
                    type="password" placeholder="Password" 
                    value={password} onChange={(e) => setPassword(e.target.value)} 
                    style={{ display: "block", marginBottom: "10px", width: "100%" }}
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}