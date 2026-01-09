import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import {
    BookOpen, Calendar, Users, Activity,
    ArrowRight, Bell, User, HelpCircle,
    Briefcase, TrendingUp, Award, Zap
} from "lucide-react";

export default function DashboardHome() {
    const [user, setUser] = useState({});
    const [courseCount, setCourseCount] = useState(0);
    const [eventCount, setEventCount] = useState(0);
    const [publishedEventCount, setPublishedEventCount] = useState(0);
    const [totalBuyers, setTotalBuyers] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("user") || "{}");
        setUser(data);
        fetchDashboardStats(data);
    }, []);

    const fetchDashboardStats = async (userData) => {
        try {
            const purchaseRes = await api.get("/user/purchases");
            const purchases = purchaseRes.data.purchases || [];
            const uniqueEvents = new Set(purchases.map(p => p.event_id));
            setCourseCount(uniqueEvents.size);

            if (userData.roles?.includes("ORGANIZER")) {
                try {
                    const eventsRes = await api.get("/organization/events");
                    const events = eventsRes.data.events || [];
                    setEventCount(events.length);
                    const published = events.filter(ev => ev.publish_status === "PUBLISHED").length;
                    setPublishedEventCount(published);

                    const reportRes = await api.get("/organization/report");
                    const reportEvents = reportRes.data.events || [];
                    const buyers = reportEvents.reduce((sum, ev) => sum + (ev.buyers || 0), 0);
                    setTotalBuyers(buyers);
                } catch (err) {
                    console.log("Org data error:", err);
                }
            }
        } catch (error) {
            console.error("Dashboard error:", error);
        } finally {
            setLoading(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Selamat Pagi";
        if (hour < 15) return "Selamat Siang";
        if (hour < 18) return "Selamat Sore";
        return "Selamat Malam";
    };

    return (
        <div style={{ paddingBottom: "40px" }}>
            {/* ================= HERO ================= */}
            <div
                className="animate-fade-in"
                style={{
                    background: "linear-gradient(120deg, #2563eb, #1e40af)",
                    borderRadius: "24px",
                    padding: "40px",
                    color: "white",
                    marginBottom: "40px",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 20px 40px -10px rgba(37, 99, 235, 0.4)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                <div style={{ position: "relative", zIndex: 1, maxWidth: "600px" }}>
                    <div
                        style={{
                            display: "inline-block",
                            padding: "6px 16px",
                            background: "rgba(255,255,255,0.15)",
                            borderRadius: "20px",
                            fontSize: "0.85rem",
                            marginBottom: "16px",
                            backdropFilter: "blur(4px)",
                            border: "1px solid rgba(255,255,255,0.3)"
                        }}
                    >
                        {new Date().toLocaleDateString("id-ID", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric"
                        })}
                    </div>

                    <h1
                        style={{
                            margin: "0 0 12px 0",
                            fontSize: "2.5rem",
                            fontWeight: "800",
                            lineHeight: "1.2"
                        }}
                    >
                        {getGreeting()}, <br />
                        <span style={{ opacity: 0.9 }}>
                            {user.name || "User"}!
                        </span>
                    </h1>

                    {/* ====== TEKS DIPERBAIKI ====== */}
                    <p
                        style={{
                            margin: 0,
                            fontSize: "1.1rem",
                            fontWeight: "500",
                            color: "#e0f2fe",
                            textShadow: "0 2px 6px rgba(0,0,0,0.35)",
                            letterSpacing: "0.2px"
                        }}
                    >
                        Siap untuk melanjutkan pembelajaran hari ini?
                    </p>
                </div>
            </div>

            {/* ================= STATISTIK ================= */}
            <div style={{ marginBottom: "48px" }}>
                <h3 style={{ marginBottom: "24px", color: "#1e293b" }}>
                    Statistik Anda
                </h3>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                        gap: "24px"
                    }}
                >
                    <StatCard
                        title="Kursus Diikuti"
                        value={loading ? "..." : courseCount}
                        icon={BookOpen}
                        color="blue"
                        trend="+2 bulan ini"
                    />

                    {user.roles?.includes("ORGANIZER") && (
                        <>
                            <StatCard
                                title="Event Publik"
                                value={loading ? "..." : publishedEventCount}
                                subtitle={`dari ${eventCount} total event`}
                                icon={Calendar}
                                color="green"
                            />
                            <StatCard
                                title="Total Peserta"
                                value={loading ? "..." : totalBuyers}
                                icon={Users}
                                color="orange"
                            />
                        </>
                    )}

                    <StatCard
                        title="Sertifikat"
                        value="0"
                        icon={Award}
                        color="purple"
                        subtitle="Segera hadir"
                    />
                </div>
            </div>

            {/* ================= AKSES CEPAT ================= */}
            <h3 style={{ marginBottom: "24px", color: "#1e293b" }}>
                Akses Cepat
            </h3>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: "20px"
                }}
            >
                <ActionCard label="Jelajahi Event" desc="Temukan webinar baru" href="/" icon={Zap} color="blue" />
                <ActionCard label="Kursus Saya" desc="Lanjutkan belajar" href="/dashboard/my-courses" icon={BookOpen} color="indigo" />
                <ActionCard label="Edit Profil" desc="Update data diri" href="/dashboard/profile" icon={User} color="slate" />
                <ActionCard label="Bantuan" desc="Pusat bantuan" href="/dashboard/reports/create" icon={HelpCircle} color="teal" />
            </div>
        </div>
    );
}

/* ================= COMPONENTS ================= */

function StatCard({ title, value, subtitle, icon: Icon, color, trend }) {
    const colors = {
        blue: { bg: "#eff6ff", text: "#3b82f6" },
        green: { bg: "#f0fdf4", text: "#22c55e" },
        orange: { bg: "#fff7ed", text: "#f97316" },
        purple: { bg: "#faf5ff", text: "#a855f7" }
    };

    const theme = colors[color] || colors.blue;

    return (
        <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            border: "1px solid #f1f5f9"
        }}>
            <div style={{ background: theme.bg, color: theme.text, width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={24} />
            </div>
            <h4 style={{ margin: "12px 0 4px", fontSize: "2rem" }}>{value}</h4>
            <p style={{ margin: 0, color: "#64748b" }}>{title}</p>
            {subtitle && <small>{subtitle}</small>}
        </div>
    );
}

function ActionCard({ label, desc, href, icon: Icon, color }) {
    const colors = {
        blue: "#3b82f6",
        indigo: "#6366f1",
        slate: "#64748b",
        teal: "#14b8a6"
    };

    const iconColor = colors[color];

    return (
        <Link to={href} style={{ textDecoration: "none" }}>
            <div style={{
                background: "white",
                padding: "20px",
                borderRadius: "16px",
                border: "1px solid #e2e8f0"
            }}>
                <Icon size={24} color={iconColor} />
                <h4>{label}</h4>
                <p>{desc}</p>
            </div>
        </Link>
    );
}
