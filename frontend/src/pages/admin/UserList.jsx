import { useEffect, useState } from "react";
import api from "../../api";

export default function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const getImgUrl = (path) => {
        if (!path) return null;
        if (path.startsWith("http")) return path;
        return `http://localhost:8080/${path}`;
    };

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get("/admin/users");
            setUsers(res.data.users || []);
        } catch (err) {
            console.error("Gagal mengambil data user:", err);
            setError("Gagal memuat data user. Pastikan Anda login sebagai Admin.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Yakin ingin menghapus user ini? Aksi ini tidak dapat dibatalkan.")) return;

        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(users.filter(u => u.id !== id));
            alert("User berhasil dihapus.");
        } catch (err) {
            console.error(err);
            alert("Gagal menghapus user: " + (err.response?.data?.error || "Terjadi kesalahan"));
        }
    };

    return (
        <div>
            {/* Header */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px"
            }}>
                <div>
                    <h2 style={{ margin: "0 0 4px 0", color: "#1e293b", fontSize: "1.5rem" }}>
                        👥 Manajemen User
                    </h2>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
                        Kelola semua pengguna terdaftar
                    </p>
                </div>
                <button
                    onClick={fetchUsers}
                    style={{
                        padding: "10px 16px",
                        background: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        color: "#374151",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s ease"
                    }}
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Error Alert */}
            {error && (
                <div style={{
                    background: "#fef2f2",
                    color: "#dc2626",
                    padding: "16px",
                    borderRadius: "8px",
                    marginBottom: "20px",
                    border: "1px solid #fecaca",
                    fontSize: "0.9rem"
                }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Table Card */}
            <div style={{
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                overflow: "hidden"
            }}>
                {loading ? (
                    <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                        <div style={{
                            width: "32px",
                            height: "32px",
                            border: "3px solid #e2e8f0",
                            borderTopColor: "#3b82f6",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                            margin: "0 auto 12px"
                        }}></div>
                        Memuat data user...
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
                            <thead>
                                <tr style={{ background: "#f8fafc" }}>
                                    <th style={thStyle}>ID</th>
                                    <th style={thStyle}>User Info</th>
                                    <th style={thStyle}>Email</th>
                                    <th style={thStyle}>Role</th>
                                    <th style={{ ...thStyle, textAlign: "center" }}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
                                            Tidak ada data user.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map(u => (
                                        <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                                            <td style={tdStyle}>
                                                <span style={{
                                                    background: "#eff6ff",
                                                    color: "#3b82f6",
                                                    padding: "4px 8px",
                                                    borderRadius: "6px",
                                                    fontSize: "0.8rem",
                                                    fontWeight: "600"
                                                }}>
                                                    #{u.id}
                                                </span>
                                            </td>

                                            <td style={tdStyle}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                    <div style={{
                                                        width: "42px",
                                                        height: "42px",
                                                        borderRadius: "10px",
                                                        background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                                                        overflow: "hidden",
                                                        flexShrink: 0,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center"
                                                    }}>
                                                        {u.profile_img ? (
                                                            <img
                                                                src={getImgUrl(u.profile_img)}
                                                                alt={u.name}
                                                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                                onError={(e) => { e.target.style.display = 'none' }}
                                                            />
                                                        ) : (
                                                            <span style={{ fontSize: "1.2rem" }}>👤</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: "600", color: "#1e293b", fontSize: "0.9rem" }}>
                                                            {u.name}
                                                        </div>
                                                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                                                            {u.phone || "No phone"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td style={{ ...tdStyle, color: "#475569" }}>{u.email}</td>

                                            <td style={tdStyle}>
                                                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                                    {u.roles && u.roles.length > 0 ? (
                                                        u.roles.map((r, idx) => {
                                                            let badgeStyle = { bg: "#f1f5f9", text: "#475569" };
                                                            if (r === "ADMIN") badgeStyle = { bg: "#fef2f2", text: "#dc2626" };
                                                            if (r === "ORGANIZATION" || r === "ORGANIZER") badgeStyle = { bg: "#f0fdf4", text: "#16a34a" };

                                                            return (
                                                                <span key={idx} style={{
                                                                    background: badgeStyle.bg,
                                                                    color: badgeStyle.text,
                                                                    padding: "4px 10px",
                                                                    borderRadius: "6px",
                                                                    fontSize: "0.75rem",
                                                                    fontWeight: "600"
                                                                }}>
                                                                    {r}
                                                                </span>
                                                            );
                                                        })
                                                    ) : (
                                                        <span style={{
                                                            background: "#f1f5f9",
                                                            color: "#64748b",
                                                            padding: "4px 10px",
                                                            borderRadius: "6px",
                                                            fontSize: "0.75rem",
                                                            fontWeight: "600"
                                                        }}>
                                                            USER
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            <td style={{ ...tdStyle, textAlign: "center" }}>
                                                {u.roles?.includes("ADMIN") ? (
                                                    <span style={{
                                                        fontSize: "0.8rem",
                                                        color: "#94a3b8",
                                                        fontStyle: "italic"
                                                    }}>
                                                        🔒 Protected
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => handleDelete(u.id)}
                                                        style={{
                                                            color: "white",
                                                            background: "linear-gradient(135deg, #ef4444, #dc2626)",
                                                            border: "none",
                                                            padding: "8px 14px",
                                                            borderRadius: "6px",
                                                            cursor: "pointer",
                                                            fontWeight: "600",
                                                            fontSize: "0.8rem",
                                                            transition: "all 0.2s ease"
                                                        }}
                                                    >
                                                        🗑 Hapus
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

const thStyle = {
    padding: "14px 16px",
    textAlign: "left",
    fontWeight: "600",
    color: "#475569",
    fontSize: "0.8rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "2px solid #e2e8f0"
};

const tdStyle = {
    padding: "16px",
    verticalAlign: "middle"
};