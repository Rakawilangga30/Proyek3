import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import toast from 'react-hot-toast';
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

            toast.success("Login Berhasil!");

            // REDIRECT LOGIC - User biasa ke landing page, Admin/Organizer ke dashboard
            setTimeout(() => {
                if (formattedRoles.includes("ADMIN")) {
                    navigate("/dashboard/admin/users");
                } else if (formattedRoles.includes("ORGANIZER")) {
                    navigate("/dashboard/org/events");
                } else {
                    // User biasa langsung ke halaman utama (landing page)
                    navigate("/");
                }
                window.location.reload();
            }, 1000);

        } catch (error) {
            console.error(error);
            toast.error("Login Gagal: " + (error.response?.data?.error || "Cek Email/Password"));
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
            background: "linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%)",
            padding: "20px"
        }}>
            <div className="animate-scale-in" style={{
                width: "100%",
                maxWidth: "420px",
                padding: "40px",
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(10px)",
                borderRadius: "24px",
                boxShadow: "0 20px 40px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.5)"
            }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <div style={{
                        width: "64px",
                        height: "64px",
                        background: "linear-gradient(135deg, var(--primary-500), var(--primary-700))",
                        borderRadius: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px",
                        color: "white",
                        boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3)"
                    }}>
                        <Lock size={32} />
                    </div>
                    <h2 style={{
                        margin: "0 0 8px 0",
                        color: "var(--gray-900)",
                        fontSize: "1.75rem",
                        fontWeight: "700",
                        letterSpacing: "-0.025em"
                    }}>
                        Masuk Akun
                    </h2>
                    <p style={{
                        color: "var(--gray-500)",
                        margin: 0,
                        fontSize: "0.95rem"
                    }}>
                        Selamat datang kembali! Silakan login untuk melanjutkan.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div>
                        <label className="form-label">Email</label>
                        <div style={{ position: "relative" }}>
                            <Mail size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                            <input
                                type="email"
                                className="form-input"
                                placeholder="nama@email.com"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                style={{ paddingLeft: "40px" }}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="form-label">Password</label>
                        <div style={{ position: "relative" }}>
                            <Lock size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{ paddingLeft: "40px" }}
                            />
                        </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <Link to="/forgot-password" style={{ fontSize: "0.85rem", color: "var(--primary-600)", fontWeight: "500" }}>
                            Lupa password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary btn-full"
                        style={{ padding: "12px" }}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} /> Memproses...
                            </>
                        ) : (
                            <>
                                Masuk <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div style={{ marginTop: "32px", textAlign: "center" }}>
                    <p style={{ fontSize: "0.9rem", color: "var(--gray-500)" }}>
                        Belum punya akun?{" "}
                        <Link to="/register" style={{ color: "var(--primary-600)", fontWeight: "600" }}>
                            Daftar disini
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}