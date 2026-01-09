import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, KeyRound, Lock, CheckCircle2 } from "lucide-react";
import toast from 'react-hot-toast';
import api from "../api";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // Step 1: Request reset code
    const handleRequestCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/forgot-password", { email });
            toast.success("Kode verifikasi telah dikirim ke email Anda!");
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.error || "Gagal mengirim kode");
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify code
    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/verify-code", { email, code });
            toast.success("Kode valid!");
            setStep(3);
        } catch (error) {
            toast.error(error.response?.data?.error || "Kode tidak valid");
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Password dan konfirmasi tidak cocok!");
            return;
        }
        setLoading(true);
        try {
            await api.post("/reset-password", { email, code, password, confirm_password: confirmPassword });
            toast.success("Password berhasil direset!");
            setTimeout(() => navigate("/login"), 1500);
        } catch (error) {
            toast.error(error.response?.data?.error || "Gagal reset password");
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
                boxShadow: "0 20px 40px -5px rgba(0, 0, 0, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.5)"
            }}>
                {/* Progress Steps */}
                <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "32px" }}>
                    {[1, 2, 3].map(s => (
                        <div key={s} style={{
                            width: s === step ? "32px" : "8px",
                            height: "8px",
                            borderRadius: "4px",
                            background: s <= step ? "linear-gradient(135deg, #3b82f6, #1e40af)" : "#e2e8f0",
                            transition: "all 0.3s ease"
                        }} />
                    ))}
                </div>

                {step === 1 && (
                    <>
                        <div style={{ textAlign: "center", marginBottom: "32px" }}>
                            <div style={{
                                width: "64px", height: "64px",
                                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                                borderRadius: "16px",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                margin: "0 auto 16px", color: "white"
                            }}>
                                <Mail size={32} />
                            </div>
                            <h2 style={{ margin: "0 0 8px 0", color: "#1e293b", fontSize: "1.5rem", fontWeight: "700" }}>
                                Lupa Password?
                            </h2>
                            <p style={{ color: "#64748b", margin: 0, fontSize: "0.9rem" }}>
                                Masukkan email Anda untuk menerima kode verifikasi.
                            </p>
                        </div>
                        <form onSubmit={handleRequestCode} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div>
                                <label className="form-label">Email</label>
                                <div style={{ position: "relative" }}>
                                    <Mail size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                    <input type="email" className="form-input" placeholder="nama@email.com" required
                                        value={email} onChange={e => setEmail(e.target.value)} style={{ paddingLeft: "40px" }} />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ padding: "12px", background: "linear-gradient(135deg, #f59e0b, #d97706)" }}>
                                {loading ? <><Loader2 className="animate-spin" size={20} /> Mengirim...</> : "Kirim Kode Verifikasi"}
                            </button>
                        </form>
                    </>
                )}

                {step === 2 && (
                    <>
                        <div style={{ textAlign: "center", marginBottom: "32px" }}>
                            <div style={{
                                width: "64px", height: "64px",
                                background: "linear-gradient(135deg, #10b981, #059669)",
                                borderRadius: "16px",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                margin: "0 auto 16px", color: "white"
                            }}>
                                <KeyRound size={32} />
                            </div>
                            <h2 style={{ margin: "0 0 8px 0", color: "#1e293b", fontSize: "1.5rem", fontWeight: "700" }}>
                                Masukkan Kode
                            </h2>
                            <p style={{ color: "#64748b", margin: 0, fontSize: "0.9rem" }}>
                                Kode verifikasi telah dikirim ke <strong>{email}</strong>
                            </p>
                        </div>
                        <form onSubmit={handleVerifyCode} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div>
                                <label className="form-label">Kode Verifikasi (6 digit)</label>
                                <input type="text" className="form-input" placeholder="000000" required maxLength={6}
                                    value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                                    style={{ textAlign: "center", fontSize: "1.5rem", letterSpacing: "8px", fontWeight: "700" }} />
                            </div>
                            <button type="submit" disabled={loading || code.length !== 6} className="btn btn-primary btn-full" style={{ padding: "12px" }}>
                                {loading ? <><Loader2 className="animate-spin" size={20} /> Memverifikasi...</> : "Verifikasi Kode"}
                            </button>
                            <button type="button" onClick={() => setStep(1)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "0.9rem" }}>
                                ← Ubah email
                            </button>
                        </form>
                        <div style={{ marginTop: "20px", padding: "12px", background: "#fef3c7", borderRadius: "8px", textAlign: "center" }}>
                            <p style={{ margin: 0, color: "#92400e", fontSize: "0.85rem" }}>⏰ Kode kadaluarsa dalam 15 menit</p>
                        </div>
                    </>
                )}

                {step === 3 && (
                    <>
                        <div style={{ textAlign: "center", marginBottom: "32px" }}>
                            <div style={{
                                width: "64px", height: "64px",
                                background: "linear-gradient(135deg, #3b82f6, #1e40af)",
                                borderRadius: "16px",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                margin: "0 auto 16px", color: "white"
                            }}>
                                <Lock size={32} />
                            </div>
                            <h2 style={{ margin: "0 0 8px 0", color: "#1e293b", fontSize: "1.5rem", fontWeight: "700" }}>
                                Buat Password Baru
                            </h2>
                            <p style={{ color: "#64748b", margin: 0, fontSize: "0.9rem" }}>
                                Masukkan password baru untuk akun Anda.
                            </p>
                        </div>
                        <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div>
                                <label className="form-label">Password Baru</label>
                                <div style={{ position: "relative" }}>
                                    <Lock size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                    <input type="password" className="form-input" placeholder="Minimal 6 karakter" required minLength={6}
                                        value={password} onChange={e => setPassword(e.target.value)} style={{ paddingLeft: "40px" }} />
                                </div>
                            </div>
                            <div>
                                <label className="form-label">Konfirmasi Password</label>
                                <div style={{ position: "relative" }}>
                                    <Lock size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                                    <input type="password" className="form-input" placeholder="Ulangi password" required
                                        value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                        style={{ paddingLeft: "40px", borderColor: confirmPassword && password !== confirmPassword ? "#ef4444" : undefined }} />
                                </div>
                                {confirmPassword && password !== confirmPassword && (
                                    <p style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "4px" }}>Password tidak cocok</p>
                                )}
                            </div>
                            <button type="submit" disabled={loading || password !== confirmPassword} className="btn btn-primary btn-full" style={{ padding: "12px" }}>
                                {loading ? <><Loader2 className="animate-spin" size={20} /> Memproses...</> : <><CheckCircle2 size={20} /> Reset Password</>}
                            </button>
                        </form>
                    </>
                )}

                <div style={{ marginTop: "24px", textAlign: "center" }}>
                    <Link to="/login" style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", color: "#64748b" }}>
                        <ArrowLeft size={16} /> Kembali ke Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
