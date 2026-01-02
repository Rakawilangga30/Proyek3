import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

export default function Dashboard() {
    const [events, setEvents] = useState([]);
    const [upcoming, setUpcoming] = useState([]);
    const [featuredEvents, setFeaturedEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                // Fetch regular events and featured events separately
                const [eventsRes, featuredRes] = await Promise.all([
                    api.get("/events"),
                    api.get("/featured-events").catch(() => ({ data: { featured: [] } }))
                ]);

                setEvents(eventsRes.data.events || []);
                setUpcoming(eventsRes.data.upcoming || []);

                // Use featured from admin selection, fallback to first 5 events
                const featured = featuredRes.data.featured || [];
                if (featured.length > 0) {
                    // Map featured events to match expected format
                    const mappedFeatured = featured.map(f => ({
                        id: f.event_id,
                        title: f.title,
                        description: f.description,
                        category: f.category,
                        thumbnail_url: f.thumbnail_url,
                        organization_id: f.organization_id,
                        org_name: f.org_name
                    }));
                    setFeaturedEvents(mappedFeatured);
                } else {
                    // Fallback to first 5 regular events
                    setFeaturedEvents((eventsRes.data.events || []).slice(0, 5));
                }
            } catch (error) {
                console.error("Gagal load events:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    // Auto-slide for banner
    useEffect(() => {
        if (featuredEvents.length > 1) {
            const timer = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % featuredEvents.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [featuredEvents.length]);

    // Helper to properly format thumbnail URLs
    const getThumbnailUrl = (url) => {
        if (!url) return null;
        // Clean up the URL - remove any leading slashes and ensure proper format
        let cleanUrl = url.replace(/^\/+/, '').replace(/\\/g, '/');
        // Ensure there's a slash between base and path
        return `http://localhost:8080/${cleanUrl}`;
    };

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

            {/* FEATURED BANNER SLIDER */}
            {featuredEvents.length > 0 && (
                <div style={{ marginBottom: "48px" }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "16px"
                    }}>
                        <span style={{ fontSize: "1.5rem" }}>⭐</span>
                        <h2 style={{ margin: 0, color: "#1e293b", fontSize: "1.25rem" }}>Featured Events</h2>
                    </div>

                    <div style={{
                        position: "relative",
                        borderRadius: "16px",
                        overflow: "hidden",
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                    }}>
                        {/* Slides */}
                        <div style={{
                            display: "flex",
                            transition: "transform 0.5s ease",
                            transform: `translateX(-${currentSlide * 100}%)`
                        }}>
                            {featuredEvents.map((evt, idx) => (
                                <Link
                                    key={evt.id}
                                    to={`/event/${evt.id}`}
                                    style={{
                                        minWidth: "100%",
                                        height: "280px",
                                        background: evt.thumbnail_url
                                            ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${getThumbnailUrl(evt.thumbnail_url)})`
                                            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        display: "flex",
                                        alignItems: "flex-end",
                                        padding: "32px",
                                        textDecoration: "none",
                                        color: "white"
                                    }}
                                >
                                    <div>
                                        {evt.category && (
                                            <span style={{
                                                background: "rgba(255,255,255,0.2)",
                                                padding: "6px 14px",
                                                borderRadius: "20px",
                                                fontSize: "0.8rem",
                                                marginBottom: "12px",
                                                display: "inline-block"
                                            }}>
                                                {evt.category}
                                            </span>
                                        )}
                                        <h3 style={{ margin: "0 0 8px 0", fontSize: "1.75rem", fontWeight: "700" }}>
                                            {evt.title}
                                        </h3>
                                        <p style={{ margin: 0, opacity: 0.9, maxWidth: "500px" }}>
                                            {(evt.description || "").substring(0, 120)}...
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Dots */}
                        <div style={{
                            position: "absolute",
                            bottom: "16px",
                            right: "32px",
                            display: "flex",
                            gap: "8px"
                        }}>
                            {featuredEvents.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentSlide(idx)}
                                    style={{
                                        width: currentSlide === idx ? "24px" : "8px",
                                        height: "8px",
                                        borderRadius: "4px",
                                        background: currentSlide === idx ? "white" : "rgba(255,255,255,0.5)",
                                        border: "none",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease"
                                    }}
                                />
                            ))}
                        </div>

                        {/* Nav Arrows */}
                        {featuredEvents.length > 1 && (
                            <>
                                <button
                                    onClick={() => setCurrentSlide((prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length)}
                                    style={{
                                        position: "absolute",
                                        left: "16px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "50%",
                                        background: "rgba(255,255,255,0.9)",
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: "1.2rem",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}
                                >←</button>
                                <button
                                    onClick={() => setCurrentSlide((prev) => (prev + 1) % featuredEvents.length)}
                                    style={{
                                        position: "absolute",
                                        right: "16px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "50%",
                                        background: "rgba(255,255,255,0.9)",
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: "1.2rem",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center"
                                    }}
                                >→</button>
                            </>
                        )}
                    </div>
                </div>
            )}

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
                            <EventCard key={evt.id} event={evt} isUpcoming={true} formatDate={formatDate} getThumbnailUrl={getThumbnailUrl} />
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
                            <EventCard key={evt.id} event={evt} isUpcoming={false} formatDate={formatDate} getThumbnailUrl={getThumbnailUrl} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// Event Card Component
function EventCard({ event, isUpcoming, formatDate, getThumbnailUrl }) {
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
                        src={getThumbnailUrl(evt.thumbnail_url)}
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