import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";

export default function OrgEventList() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyEvents();
    }, []);

    const fetchMyEvents = async () => {
        try {
            const res = await api.get("/organization/report");
            setEvents(res.data.events || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
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
                Memuat event organisasi...
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
                flexWrap: "wrap",
                gap: "16px"
            }}>
                <div>
                    <h2 style={{ margin: "0 0 4px 0", color: "#1e293b", fontSize: "1.5rem" }}>
                        📊 Report Organisasi
                    </h2>
                    <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
                        Lihat laporan dan statistik event Anda
                    </p>
                </div>
                <Link
                    to="/dashboard/org"
                    style={{
                        padding: "10px 18px",
                        background: "white",
                        color: "#374151",
                        textDecoration: "none",
                        borderRadius: "8px",
                        fontWeight: "500",
                        fontSize: "0.9rem",
                        border: "1px solid #e2e8f0",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px"
                    }}
                >
                    🏢 Dashboard Org
                </Link>
            </div>

            {/* Content Card */}
            <div style={{
                background: "white",
                borderRadius: "12px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                padding: "32px",
                minHeight: "300px"
            }}>
                {events.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "48px 20px",
                        color: "#64748b"
                    }}>
                        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📭</div>
                        <p style={{ margin: "0 0 8px 0", fontWeight: "500", color: "#1e293b" }}>
                            Belum ada data report
                        </p>
                        <p style={{ margin: 0, fontSize: "0.9rem" }}>
                            Buat event dan mulai menjual untuk melihat laporan
                        </p>
                        <Link
                            to="/dashboard/org/create-event"
                            style={{
                                display: "inline-block",
                                marginTop: "20px",
                                padding: "12px 24px",
                                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                                color: "white",
                                textDecoration: "none",
                                borderRadius: "8px",
                                fontWeight: "600",
                                fontSize: "0.9rem"
                            }}
                        >
                            ➕ Buat Event Baru
                        </Link>
                    </div>
                ) : (
                    <div style={{ display: "grid", gap: "16px" }}>
                        {events.map(event => (
                            <div key={event.id} style={{
                                border: "1px solid #e2e8f0",
                                borderRadius: "10px",
                                padding: "16px",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center"
                            }}>
                                <div>
                                    <h4 style={{ margin: "0 0 4px 0", color: "#1e293b" }}>
                                        {event.title}
                                    </h4>
                                    <span style={{ color: "#64748b", fontSize: "0.9rem" }}>
                                        {event.total_buyers || 0} pembeli
                                    </span>
                                </div>
                                <Link
                                    to={`/dashboard/org/event/${event.id}/manage`}
                                    style={{
                                        padding: "8px 14px",
                                        background: "#eff6ff",
                                        color: "#3b82f6",
                                        textDecoration: "none",
                                        borderRadius: "6px",
                                        fontWeight: "500",
                                        fontSize: "0.85rem"
                                    }}
                                >
                                    Kelola
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}