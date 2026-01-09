import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, ArrowRight, Loader2, UserPlus } from "lucide-react";
import toast from 'react-hot-toast';
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
            toast.success("Registrasi Berhasil! Silakan Login.");
            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (error) {
            console.error(error);
            toast.error("Registrasi Gagal: " + (error.response?.data?.error || "Terjadi kesalahan"));
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
                        background: "linear-gradient(135deg, var(--success-500), #059669)",
                        borderRadius: "16px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px",
                        color: "white",
                        boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.3)"
                    }}>
                        <UserPlus size={32} />
                    </div>
                    <h2 style={{
                        margin: "0 0 8px 0",
                        color: "var(--gray-900)",
                        fontSize: "1.75rem",
                        fontWeight: "700",
                        letterSpacing: "-0.025em"
                    }}>
                        Buat Akun Baru
                    </h2>
                    <p style={{
                        color: "var(--gray-500)",
                        margin: 0,
                        fontSize: "0.95rem"
                    }}>
                        Bergabunglah dan mulai belajar hari ini!
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                    <div>
                        <label className="form-label">Nama Lengkap</label>
                        <div style={{ position: "relative" }}>
                            <User size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--gray-400)" }} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Masukkan nama lengkap"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                style={{ paddingLeft: "40px" }}
                            />
                        </div>
                    </div>

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
                                placeholder="Minimal 6 karakter"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                style={{ paddingLeft: "40px" }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-full"
                        style={{
                            padding: "12px",
                            background: loading ? "var(--gray-400)" : "linear-gradient(135deg, var(--success-500), #059669)",
                            color: "white",
                            boxShadow: "0 4px 6px -1px rgba(16, 185, 129, 0.2)"
                        }}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={20} /> Memproses...
                            </>
                        ) : (
                            <>
                                Daftar Sekarang <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer */}
                <div style={{ marginTop: "32px", textAlign: "center" }}>
                    <p style={{ fontSize: "0.9rem", color: "var(--gray-500)" }}>
                        Sudah punya akun?{" "}
                        <Link to="/login" style={{ color: "var(--primary-600)", fontWeight: "600" }}>
                            Login disini
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}