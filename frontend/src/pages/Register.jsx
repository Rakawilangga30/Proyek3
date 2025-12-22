import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post("/register", { name, email, password, role });
            alert("Registrasi Berhasil! Silakan Login.");
            navigate("/login");
        } catch (error) {
            alert("Registrasi Gagal: " + (error.response?.data?.error || "Error"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
            padding: "20px"
        }}>
            <div style={{
                width: "100%",
                maxWidth: "420px",
                padding: "40px",
                background: "white",
                borderRadius: "16px",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <div style={{
                        width: "64px",
                        height: "64px",
                        background: "linear-gradient(135deg, #22c55e, #16a34a)",
                        borderRadius: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px",
                        fontSize: "28px"
                    }}>
                        📝
                    </div>
                    <h2 style={{
                        margin: "0 0 8px 0",
                        color: "#1e293b",
                        fontSize: "1.5rem",
                        fontWeight: "700"
                    }}>
                        Daftar Akun
                    </h2>
                    <p style={{
                        color: "#64748b",
                        margin: 0,
                        fontSize: "0.9rem"
                    }}>
                        Buat akun baru untuk mulai belajar
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div>
                        <label style={{
                            display: "block",
                            marginBottom: "6px",
                            fontWeight: "500",
                            color: "#374151",
                            fontSize: "0.875rem"
                        }}>
                            Nama Lengkap
                        </label>
                        <input
                            type="text"
                            placeholder="Masukkan nama lengkap"
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                border: "1px solid #d1d5db",
                                fontSize: "0.95rem",
                                boxSizing: "border-box"
                            }}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: "block",
                            marginBottom: "6px",
                            fontWeight: "500",
                            color: "#374151",
                            fontSize: "0.875rem"
                        }}>
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="nama@email.com"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                border: "1px solid #d1d5db",
                                fontSize: "0.95rem",
                                boxSizing: "border-box"
                            }}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: "block",
                            marginBottom: "6px",
                            fontWeight: "500",
                            color: "#374151",
                            fontSize: "0.875rem"
                        }}>
                            Password
                        </label>
                        <input
                            type="password"
                            placeholder="Minimal 6 karakter"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                border: "1px solid #d1d5db",
                                fontSize: "0.95rem",
                                boxSizing: "border-box"
                            }}
                        />
                    </div>

                    <div>
                        <label style={{
                            display: "block",
                            marginBottom: "6px",
                            fontWeight: "500",
                            color: "#374151",
                            fontSize: "0.875rem"
                        }}>
                            Daftar Sebagai
                        </label>
                        <select
                            value={role}
                            onChange={e => setRole(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                border: "1px solid #d1d5db",
                                fontSize: "0.95rem",
                                backgroundColor: "white",
                                cursor: "pointer",
                                boxSizing: "border-box"
                            }}
                        >
                            <option value="user">👤 Pengguna (Siswa)</option>
                            <option value="organizer">🏢 Organizer (Pembuat Event)</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "14px",
                            background: loading
                                ? "#94a3b8"
                                : "linear-gradient(135deg, #22c55e, #16a34a)",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontWeight: "600",
                            fontSize: "1rem",
                            marginTop: "8px"
                        }}
                    >
                        {loading ? "Memproses..." : "Daftar Sekarang"}
                    </button>
                </form>

                {/* Footer */}
                <p style={{
                    textAlign: "center",
                    marginTop: "24px",
                    fontSize: "0.9rem",
                    color: "#64748b"
                }}>
                    Sudah punya akun?{" "}
                    <Link to="/login" style={{
                        color: "#3b82f6",
                        fontWeight: "600",
                        textDecoration: "none"
                    }}>
                        Login disini
                    </Link>
                </p>
            </div>
        </div>
    );
}