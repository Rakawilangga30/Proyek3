import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

export default function AffiliateDashboard() {
    const [stats, setStats] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profileComplete, setProfileComplete] = useState(true);
    const [missingFields, setMissingFields] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [dashboardRes, profileRes] = await Promise.all([
                api.get('/affiliate/dashboard'),
                api.get('/user/profile')
            ]);

            setStats(dashboardRes.data.stats);
            setProfile(profileRes.data.user);

            // Check profile completeness
            const user = profileRes.data.user;
            const missing = [];

            if (!user.name || user.name.trim() === '') missing.push('Nama Lengkap');
            if (!user.phone || user.phone.trim() === '') missing.push('No. Telepon');
            if (!user.address || user.address.trim() === '') missing.push('Alamat');
            if (!user.gender) missing.push('Jenis Kelamin');
            if (!user.birthdate) missing.push('Tanggal Lahir');

            setMissingFields(missing);
            setProfileComplete(missing.length === 0);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount || 0);
    };

    if (loading) {
        return (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                Memuat dashboard...
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ margin: "0 0 8px 0", color: "#1e293b", fontSize: "1.75rem" }}>
                    🤝 Dashboard Affiliate
                </h1>
                <p style={{ margin: 0, color: "#64748b" }}>
                    Kelola event dan pantau pendapatan Anda
                </p>
            </div>

            {/* Profile Incomplete Warning */}
            {!profileComplete && (
                <div style={{
                    background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
                    border: "2px solid #fca5a5",
                    borderRadius: "12px",
                    padding: "20px",
                    marginBottom: "24px"
                }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                        <span style={{ fontSize: "2rem" }}>⚠️</span>
                        <div>
                            <div style={{ fontWeight: "700", color: "#dc2626", fontSize: "1.1rem", marginBottom: "8px" }}>
                                Lengkapi Profil Anda Terlebih Dahulu!
                            </div>
                            <div style={{ color: "#991b1b", marginBottom: "12px" }}>
                                Untuk menjadi affiliate/creator, Anda harus melengkapi data profil berikut:
                            </div>
                            <div style={{
                                background: "white",
                                borderRadius: "8px",
                                padding: "12px",
                                marginBottom: "16px",
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "8px"
                            }}>
                                {missingFields.map((field, index) => (
                                    <span key={index} style={{
                                        background: "#fef2f2",
                                        color: "#dc2626",
                                        padding: "4px 12px",
                                        borderRadius: "20px",
                                        fontSize: "0.85rem",
                                        fontWeight: "500",
                                        border: "1px solid #fca5a5"
                                    }}>
                                        ❌ {field}
                                    </span>
                                ))}
                            </div>
                            <Link to="/dashboard/profile" style={{
                                display: "inline-block",
                                background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                                color: "white",
                                padding: "10px 24px",
                                borderRadius: "8px",
                                textDecoration: "none",
                                fontWeight: "600",
                                fontSize: "0.9rem"
                            }}>
                                ✏️ Lengkapi Profil Sekarang
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "32px" }}>
                <div style={statCard}>
                    <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📦</div>
                    <div style={{ fontSize: "2rem", fontWeight: "700", color: "#1e293b" }}>{stats?.total_events || 0}</div>
                    <div style={{ color: "#64748b", fontSize: "0.9rem" }}>Total Event Diajukan</div>
                </div>
                <div style={statCard}>
                    <div style={{ fontSize: "2rem", marginBottom: "8px" }}>✅</div>
                    <div style={{ fontSize: "2rem", fontWeight: "700", color: "#10b981" }}>{stats?.approved_events || 0}</div>
                    <div style={{ color: "#64748b", fontSize: "0.9rem" }}>Event Disetujui</div>
                </div>
                <div style={statCard}>
                    <div style={{ fontSize: "2rem", marginBottom: "8px" }}>🛒</div>
                    <div style={{ fontSize: "2rem", fontWeight: "700", color: "#3b82f6" }}>{stats?.total_sales || 0}</div>
                    <div style={{ color: "#64748b", fontSize: "0.9rem" }}>Total Penjualan</div>
                </div>
                <div style={statCard}>
                    <div style={{ fontSize: "2rem", marginBottom: "8px" }}>💵</div>
                    <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "#10b981" }}>
                        {formatPrice((stats?.total_earnings || 0) + (stats?.pending_earnings || 0))}
                    </div>
                    <div style={{ color: "#64748b", fontSize: "0.9rem" }}>Total Pendapatan</div>
                </div>
            </div>

            {/* Earnings Breakdown */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
                marginBottom: "32px"
            }}>
                {/* Transferred Earnings */}
                <div style={{
                    background: "linear-gradient(135deg, #d1fae5, #a7f3d0)",
                    border: "1px solid #6ee7b7",
                    borderRadius: "12px",
                    padding: "20px"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "1.5rem" }}>✅</span>
                        <div>
                            <div style={{ fontWeight: "600", color: "#065f46", fontSize: "0.85rem" }}>Sudah Ditransfer Admin</div>
                            <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "#047857" }}>{formatPrice(stats?.total_earnings)}</div>
                        </div>
                    </div>
                </div>

                {/* Pending Earnings */}
                <div style={{
                    background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                    border: "1px solid #fcd34d",
                    borderRadius: "12px",
                    padding: "20px"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "1.5rem" }}>⏳</span>
                        <div>
                            <div style={{ fontWeight: "600", color: "#92400e", fontSize: "0.85rem" }}>Menunggu Transfer</div>
                            <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "#b45309" }}>{formatPrice(stats?.pending_earnings)}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>
                {profileComplete ? (
                    <Link to="/dashboard/affiliate/submit" style={actionCard}>
                        <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>➕</div>
                        <h3 style={{ margin: "0 0 8px 0", color: "#1e293b" }}>Ajukan Event Baru</h3>
                        <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
                            Kirim event baru dengan materi untuk direview admin
                        </p>
                    </Link>
                ) : (
                    <div style={{ ...actionCard, opacity: 0.5, cursor: "not-allowed" }}>
                        <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🔒</div>
                        <h3 style={{ margin: "0 0 8px 0", color: "#1e293b" }}>Ajukan Event Baru</h3>
                        <p style={{ margin: 0, color: "#ef4444", fontSize: "0.9rem", fontWeight: "500" }}>
                            Lengkapi profil untuk mengaktifkan fitur ini
                        </p>
                    </div>
                )}

                <Link to="/dashboard/affiliate/events" style={actionCard}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>📊</div>
                    <h3 style={{ margin: "0 0 8px 0", color: "#1e293b" }}>Event Saya</h3>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
                        Lihat semua event dan pendapatan per event
                    </p>
                </Link>
            </div>

            {/* Pending Events */}
            {stats?.pending_events > 0 && (
                <div style={{ marginTop: "32px" }}>
                    <div style={{
                        background: "#fff7ed",
                        border: "1px solid #fed7aa",
                        borderRadius: "12px",
                        padding: "20px"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ fontSize: "1.5rem" }}>📋</span>
                            <div>
                                <div style={{ fontWeight: "600", color: "#9a3412" }}>
                                    {stats.pending_events} event menunggu review
                                </div>
                                <div style={{ color: "#ea580c", fontSize: "0.9rem" }}>
                                    Admin sedang meninjau pengajuan Anda
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const statCard = {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    textAlign: "center",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e2e8f0"
};

const actionCard = {
    display: "block",
    background: "white",
    borderRadius: "16px",
    padding: "32px",
    textAlign: "center",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e2e8f0",
    textDecoration: "none",
    transition: "all 0.3s ease"
};
