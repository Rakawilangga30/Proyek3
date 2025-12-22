import { useEffect, useState } from "react";
import api from "../../api";

export default function AdminOrgApprovals() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/organization/applications");
            setApplications(res.data.applications || []);
        } catch (error) {
            console.error("Gagal memuat data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (appId, status) => {
        const reason = prompt(status === 'APPROVED' ? "Catatan Persetujuan (Opsional):" : "Alasan Penolakan:");
        if (status === 'REJECTED' && !reason) return alert("Alasan penolakan wajib diisi!");

        try {
            await api.post(`/admin/organization/applications/${appId}/review`, {
                status: status,
                rejection_reason: reason || ""
            });
            alert(`Aplikasi berhasil ${status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}`);
            loadData();
        } catch (error) {
            alert("Gagal memproses: " + (error.response?.data?.error || "Error"));
        }
    };

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: "24px" }}>
                <h2 style={{ margin: "0 0 4px 0", color: "#1e293b", fontSize: "1.5rem" }}>
                    📝 Persetujuan Creator
                </h2>
                <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
                    Review pengajuan menjadi organizer
                </p>
            </div>

            {/* Content */}
            <div style={{
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                padding: "24px"
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
                        Memuat data...
                    </div>
                ) : applications.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "48px 20px",
                        color: "#64748b"
                    }}>
                        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>✅</div>
                        <p style={{ margin: 0, fontWeight: "500" }}>Tidak ada pengajuan pending saat ini.</p>
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: "16px" }}>
                        {applications.map(app => (
                            <div key={app.id} style={{
                                border: "1px solid #e2e8f0",
                                borderRadius: "12px",
                                padding: "20px",
                                background: "#fafafa",
                                transition: "all 0.2s ease"
                            }}>
                                <div style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    flexWrap: "wrap",
                                    gap: "16px"
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                            marginBottom: "12px"
                                        }}>
                                            <h3 style={{ margin: 0, color: "#1e293b", fontSize: "1.1rem" }}>
                                                {app.org_name}
                                            </h3>
                                            <span style={{
                                                fontSize: "0.75rem",
                                                background: "#dbeafe",
                                                color: "#1d4ed8",
                                                padding: "4px 10px",
                                                borderRadius: "6px",
                                                fontWeight: "600"
                                            }}>
                                                {app.org_category}
                                            </span>
                                        </div>

                                        <p style={{
                                            margin: "0 0 12px 0",
                                            fontSize: "0.9rem",
                                            color: "#475569"
                                        }}>
                                            <strong>Pemohon:</strong> User ID {app.user_id} ({app.org_email})
                                        </p>

                                        <div style={{
                                            background: "white",
                                            padding: "12px 16px",
                                            borderRadius: "8px",
                                            border: "1px solid #e2e8f0",
                                            fontStyle: "italic",
                                            color: "#64748b",
                                            fontSize: "0.9rem",
                                            marginBottom: "12px"
                                        }}>
                                            "{app.reason}"
                                        </div>

                                        {app.org_website && (
                                            <a
                                                href={app.org_website}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{
                                                    color: "#3b82f6",
                                                    fontSize: "0.9rem",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "4px"
                                                }}
                                            >
                                                🔗 Lihat Website
                                            </a>
                                        )}
                                    </div>

                                    <div style={{ display: "flex", gap: "10px", flexShrink: 0 }}>
                                        <button
                                            onClick={() => handleReview(app.id, "APPROVED")}
                                            style={{
                                                padding: "10px 18px",
                                                background: "linear-gradient(135deg, #22c55e, #16a34a)",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "8px",
                                                cursor: "pointer",
                                                fontWeight: "600",
                                                fontSize: "0.9rem",
                                                transition: "all 0.2s ease"
                                            }}
                                        >
                                            ✅ Setujui
                                        </button>
                                        <button
                                            onClick={() => handleReview(app.id, "REJECTED")}
                                            style={{
                                                padding: "10px 18px",
                                                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                                                color: "white",
                                                border: "none",
                                                borderRadius: "8px",
                                                cursor: "pointer",
                                                fontWeight: "600",
                                                fontSize: "0.9rem",
                                                transition: "all 0.2s ease"
                                            }}
                                        >
                                            ❌ Tolak
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}