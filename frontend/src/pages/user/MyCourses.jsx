import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";

export default function MyCourses() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyCourses();
    }, []);

    const fetchMyCourses = async () => {
        try {
            const res = await api.get("/user/purchases");
            const purchases = res.data.purchases || [];

            // Group purchases by event
            const byEvent = {};
            purchases.forEach(p => {
                const eid = p.event_id || p.EventID || 0;
                if (!byEvent[eid]) {
                    byEvent[eid] = {
                        event_id: eid,
                        event_title: p.event_title || p.EventTitle || "Untitled Event",
                        thumbnail: p.thumbnail_url || p.EventThumb || null,
                        sessions: []
                    };
                }
                byEvent[eid].sessions.push({
                    id: p.session_id || p.SessionID,
                    title: p.session_title || p.Title || "Sesi",
                    purchase_id: p.id || p.PurchaseID,
                    price: p.price_paid
                });
            });

            const grouped = Object.values(byEvent);
            setCourses(grouped);
        } catch (error) {
            console.error("Gagal ambil kursus:", error);
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
                Memuat kursus...
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: "24px" }}>
                <h2 style={{ margin: "0 0 4px 0", color: "#1e293b", fontSize: "1.5rem" }}>
                    📚 Kursus Saya
                </h2>
                <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
                    Lihat semua kursus yang telah Anda beli
                </p>
            </div>

            {courses.length === 0 ? (
                <div style={{
                    background: "white",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    padding: "48px 20px",
                    textAlign: "center"
                }}>
                    <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📭</div>
                    <p style={{ margin: "0 0 8px 0", fontWeight: "500", color: "#1e293b" }}>
                        Belum ada kursus yang diikuti
                    </p>
                    <p style={{ margin: "0 0 20px 0", color: "#64748b", fontSize: "0.9rem" }}>
                        Jelajahi kursus menarik untuk mulai belajar
                    </p>
                    <Link
                        to="/"
                        style={{
                            display: "inline-block",
                            padding: "12px 24px",
                            background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: "8px",
                            fontWeight: "600",
                            fontSize: "0.9rem"
                        }}
                    >
                        🔍 Jelajahi Kursus
                    </Link>
                </div>
            ) : (
                <div style={{ display: "grid", gap: "20px" }}>
                    {courses.map(eventGroup => (
                        <div key={eventGroup.event_id} style={{
                            background: "white",
                            borderRadius: "12px",
                            overflow: "hidden",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                        }}>
                            {/* Event Header */}
                            <div style={{
                                display: "flex",
                                gap: "16px",
                                alignItems: "center",
                                padding: "20px",
                                borderBottom: "1px solid #f1f5f9",
                                background: "#fafafa"
                            }}>
                                <div style={{
                                    width: "100px",
                                    height: "70px",
                                    background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                                    borderRadius: "8px",
                                    overflow: "hidden",
                                    flexShrink: 0
                                }}>
                                    {eventGroup.thumbnail ? (
                                        <img
                                            src={`http://localhost:8080/${eventGroup.thumbnail}`}
                                            alt={eventGroup.event_title}
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                    ) : (
                                        <div style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            height: "100%",
                                            fontSize: "1.5rem"
                                        }}>
                                            🎓
                                        </div>
                                    )}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: "0 0 4px 0", color: "#1e293b", fontSize: "1.1rem" }}>
                                        {eventGroup.event_title}
                                    </h3>
                                    <span style={{
                                        background: "#dbeafe",
                                        color: "#1d4ed8",
                                        padding: "4px 10px",
                                        borderRadius: "6px",
                                        fontSize: "0.75rem",
                                        fontWeight: "600"
                                    }}>
                                        {eventGroup.sessions.length} sesi dibeli
                                    </span>
                                </div>
                                <Link
                                    to={`/event/${eventGroup.event_id}`}
                                    style={{
                                        padding: "10px 16px",
                                        background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                                        color: "white",
                                        textDecoration: "none",
                                        borderRadius: "8px",
                                        fontWeight: "600",
                                        fontSize: "0.85rem"
                                    }}
                                >
                                    Lihat Event
                                </Link>
                            </div>

                            {/* Sessions List */}
                            <div style={{ padding: "16px 20px" }}>
                                {eventGroup.sessions.map((s, idx) => (
                                    <div key={s.id} style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        padding: "12px 0",
                                        borderBottom: idx < eventGroup.sessions.length - 1 ? "1px solid #f1f5f9" : "none"
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: "500", color: "#1e293b", fontSize: "0.9rem" }}>
                                                {s.title}
                                            </div>
                                            <div style={{ color: "#64748b", fontSize: "0.8rem" }}>
                                                Dibayar: Rp {s.price?.toLocaleString?.() ?? s.price}
                                            </div>
                                        </div>
                                        <Link
                                            to={`/event/${eventGroup.event_id}`}
                                            style={{
                                                padding: "8px 14px",
                                                background: "#eff6ff",
                                                color: "#3b82f6",
                                                textDecoration: "none",
                                                borderRadius: "6px",
                                                fontWeight: "500",
                                                fontSize: "0.8rem"
                                            }}
                                        >
                                            ▶️ Lanjut Belajar
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}