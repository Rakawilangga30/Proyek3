import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function Dashboard() {
    const [events, setEvents] = useState([]);
    const [upcoming, setUpcoming] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await api.get("/events");
                setEvents(res.data.events || []);
                setUpcoming(res.data.upcoming || []);
            } catch (error) {
                console.error("Gagal load events:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return "Coming Soon";
        return new Date(dateString).toLocaleDateString("id-ID", {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div style={{
                padding: "60px",
                textAlign: "center",
                color: "#64748b"
            }}>
                <div style={{
                    width: "40px",
                    height: "40px",
                    border: "3px solid #e2e8f0",
                    borderTopColor: "#3b82f6",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    margin: "0 auto 16px"
                }}></div>
                Memuat Event...
            </div>
        );
    }

    return (
        <div style={{
            padding: "24px",
            maxWidth: "1200px",
            margin: "0 auto",
            minHeight: "100vh"
        }}>

            {/* HERO BANNER */}
            <div style={{
                background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)",
                color: "white",
                padding: "48px 40px",
                borderRadius: "16px",
                marginBottom: "48px",
                boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.3)",
                position: "relative",
                overflow: "hidden"
            }}>
                <div style={{
                    position: "absolute",
                    top: "-50%",
                    right: "-10%",
                    width: "300px",
                    height: "300px",
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: "50%"
                }}></div>
                <div style={{
                    position: "absolute",
                    bottom: "-30%",
                    left: "20%",
                    width: "200px",
                    height: "200px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "50%"
                }}></div>
                <div style={{ position: "relative", zIndex: 1 }}>
                    <h1 style={{ margin: "0 0 12px 0", fontSize: "2.25rem", fontWeight: "700" }}>
                        Selamat Datang di Learning Platform
                    </h1>
                    <p style={{ fontSize: "1.1rem", opacity: 0.9, margin: 0, maxWidth: "600px" }}>
                        Tingkatkan skillmu dengan materi terbaik dari para ahli.
                    </p>
                </div>
            </div>

            {/* SEKSI 1: UPCOMING EVENTS */}
            {upcoming.length > 0 && (
                <div style={{ marginBottom: "48px" }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "24px"
                    }}>
                        <div style={{
                            width: "4px",
                            height: "32px",
                            background: "linear-gradient(180deg, #f59e0b, #d97706)",
                            borderRadius: "2px"
                        }}></div>
                        <h2 style={{ margin: 0, color: "#1e293b", fontSize: "1.5rem" }}>
                            📅 Coming Soon
                        </h2>
                        <span style={{
                            fontSize: "0.8rem",
                            color: "#64748b",
                            background: "#f1f5f9",
                            padding: "4px 12px",
                            borderRadius: "20px"
                        }}>
                            Segera Hadir
                        </span>
                    </div>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                        gap: "24px"
                    }}>
                        {upcoming.map(evt => (
                            <EventCard key={evt.id} event={evt} isUpcoming={true} formatDate={formatDate} />
                        ))}
                    </div>
                </div>
            )}

            {/* SEKSI 2: AVAILABLE NOW */}
            <div>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "24px"
                }}>
                    <div style={{
                        width: "4px",
                        height: "32px",
                        background: "linear-gradient(180deg, #22c55e, #16a34a)",
                        borderRadius: "2px"
                    }}></div>
                    <h2 style={{ margin: 0, color: "#1e293b", fontSize: "1.5rem" }}>
                        🔥 Available Now
                    </h2>
                </div>

                {events.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "60px 20px",
                        background: "#f8fafc",
                        borderRadius: "12px",
                        color: "#64748b"
                    }}>
                        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>📭</div>
                        <p style={{ margin: 0 }}>Belum ada event yang aktif saat ini.</p>
                    </div>
                ) : (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                        gap: "24px"
                    }}>
                        {events.map(evt => (
                            <EventCard key={evt.id} event={evt} isUpcoming={false} formatDate={formatDate} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Event Card Component
function EventCard({ event, isUpcoming, formatDate }) {
    const evt = event;

    return (
        <div style={{
            background: "white",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            transition: "all 0.3s ease",
            position: "relative",
            border: isUpcoming ? "2px solid #fef3c7" : "1px solid #e2e8f0"
        }}>
            {/* Badge Upcoming */}
            {isUpcoming && (
                <div style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    background: "linear-gradient(135deg, #f59e0b, #d97706)",
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontSize: "0.75rem",
                    fontWeight: "600",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    zIndex: 1
                }}>
                    🔜 Upcoming
                </div>
            )}

            {/* Thumbnail */}
            <div style={{
                height: "180px",
                background: "linear-gradient(135deg, #e2e8f0, #cbd5e1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
                overflow: "hidden"
            }}>
                {evt.thumbnail_url ? (
                    <img
                        src={(evt.thumbnail_url || "").startsWith("http") ? evt.thumbnail_url : `http://localhost:8080/${(evt.thumbnail_url || "").replace(/^\/+/, "")}`}
                        alt={evt.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                ) : (
                    <span style={{ fontSize: "3rem" }}>🖼️</span>
                )}
            </div>

            {/* Content */}
            <div style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                    <h3 style={{
                        margin: 0,
                        color: "#1e293b",
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        flex: 1,
                        paddingRight: "8px"
                    }}>
                        {evt.title}
                    </h3>
                    {evt.category && (
                        <span style={{
                            background: "#eff6ff",
                            color: "#3b82f6",
                            fontSize: "0.7rem",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontWeight: "500",
                            whiteSpace: "nowrap"
                        }}>
                            {evt.category}
                        </span>
                    )}
                </div>

                <p style={{
                    color: "#64748b",
                    fontSize: "0.9rem",
                    margin: "0 0 16px 0",
                    lineHeight: "1.5"
                }}>
                    {evt.description?.substring(0, 100)}...
                </p>

                {/* Tanggal untuk Upcoming */}
                {isUpcoming && (
                    <div style={{
                        background: "#fffbeb",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px dashed #fbbf24",
                        fontSize: "0.85rem",
                        color: "#b45309",
                        marginBottom: "16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                    }}>
                        ⏰ Tayang: {formatDate(evt.publish_at)}
                    </div>
                )}

                {/* Button */}
                <Link to={`/event/${evt.id}`} style={{
                    display: "block",
                    textAlign: "center",
                    background: isUpcoming
                        ? "white"
                        : "linear-gradient(135deg, #3b82f6, #2563eb)",
                    color: isUpcoming ? "#f59e0b" : "white",
                    border: isUpcoming ? "2px solid #f59e0b" : "none",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                    transition: "all 0.2s ease"
                }}>
                    {isUpcoming ? "Lihat Detail" : "Mulai Belajar"}
                </Link>
            </div>
        </div>
    );
}