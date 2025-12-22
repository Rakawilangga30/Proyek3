import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post("/login", { email, password });

            // Ambil raw roles dari backend
            const rawRoles = res.data.roles || [];

            // Format menjadi Array String dan normalisasi
            let formattedRoles = rawRoles.map(r => {
                if (typeof r === 'object') {
                    return (r.name || r.Name || "").toString();
                }
                return String(r || "");
            })
                .map(r => r.toUpperCase().trim())
                .map(r => r === "ORGANIZATION" ? "ORGANIZER" : r);

            // Simpan User + Roles yang sudah bersih
            const userData = {
                ...res.data.user,
                roles: formattedRoles
            };

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(userData));

            alert("Login Berhasil!");

            // REDIRECT LOGIC - User biasa ke landing page, Admin/Organizer ke dashboard
            if (formattedRoles.includes("ADMIN")) {
                navigate("/dashboard/admin/users");
            } else if (formattedRoles.includes("ORGANIZER")) {
                navigate("/dashboard/org/events");
            } else {
                // User biasa langsung ke halaman utama (landing page)
                navigate("/");
            }

            setTimeout(() => { window.location.reload() }, 100);

        } catch (error) {
            console.error(error);
            alert("Login Gagal: " + (error.response?.data?.error || "Cek Email/Password"));
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
                        background: "linear-gradient(135deg, #3b82f6, #1e40af)",
                        borderRadius: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px",
                        fontSize: "28px"
                    }}>
                        🔐
                    </div>
                    <h2 style={{
                        margin: "0 0 8px 0",
                        color: "#1e293b",
                        fontSize: "1.5rem",
                        fontWeight: "700"
                    }}>
                        Masuk Akun
                    </h2>
                    <p style={{
                        color: "#64748b",
                        margin: 0,
                        fontSize: "0.9rem"
                    }}>
                        Selamat datang kembali! Silakan login.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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
                                transition: "all 0.2s ease",
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
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "12px 16px",
                                borderRadius: "8px",
                                border: "1px solid #d1d5db",
                                fontSize: "0.95rem",
                                transition: "all 0.2s ease",
                                boxSizing: "border-box"
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "14px",
                            background: loading
                                ? "#94a3b8"
                                : "linear-gradient(135deg, #3b82f6, #2563eb)",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: loading ? "not-allowed" : "pointer",
                            fontWeight: "600",
                            fontSize: "1rem",
                            transition: "all 0.2s ease",
                            marginTop: "8px"
                        }}
                    >
                        {loading ? "Memproses..." : "Masuk"}
                    </button>
                </form>

                {/* Footer */}
                <p style={{
                    textAlign: "center",
                    marginTop: "24px",
                    fontSize: "0.9rem",
                    color: "#64748b"
                }}>
                    Belum punya akun?{" "}
                    <Link to="/register" style={{
                        color: "#3b82f6",
                        fontWeight: "600",
                        textDecoration: "none"
                    }}>
                        Daftar disini
                    </Link>
                </p>
            </div>
        </div>
    );
}