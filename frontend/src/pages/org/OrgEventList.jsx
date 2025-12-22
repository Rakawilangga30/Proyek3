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
            // Sesuai route backend: org.GET("/events", ...)
            const res = await api.get("/organization/events");
            setEvents(res.data.data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: 20 }}>Memuat event organisasi...</div>;

    return (
        <div style={{ padding: 30 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2>📋 Kelola Event Organisasi</h2>
                <Link to="/dashboard/org/create-event" style={{ padding: "10px 15px", background: "#48bb78", color: "white", textDecoration: "none", borderRadius: 5, fontWeight: "bold" }}>
                    + Buat Event Baru
                </Link>
            </div>

            <div style={{ background: "white", borderRadius: 8, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead style={{ background: "#f7fafc", borderBottom: "1px solid #e2e8f0" }}>
                        <tr>
                            <th style={{ padding: 15, textAlign: "left" }}>Judul Event</th>
                            <th style={{ padding: 15, textAlign: "left" }}>Harga</th>
                            <th style={{ padding: 15, textAlign: "left" }}>Status</th>
                            <th style={{ padding: 15, textAlign: "center" }}>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ padding: 20, textAlign: "center", color: "#718096" }}>Belum ada event dibuat.</td>
                            </tr>
                        ) : (
                            events.map(ev => (
                                <tr key={ev.ID} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                    <td style={{ padding: 15 }}>
                                        <div style={{ fontWeight: "bold" }}>{ev.title}</div>
                                    </td>
                                    <td style={{ padding: 15 }}>Rp {ev.price.toLocaleString()}</td>
                                    <td style={{ padding: 15 }}>
                                        <span style={{ 
                                            padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: "bold",
                                            background: ev.is_published ? "#c6f6d5" : "#fed7d7",
                                            color: ev.is_published ? "#22543d" : "#822727"
                                        }}>
                                            {ev.is_published ? "PUBLISHED" : "DRAFT"}
                                        </span>
                                    </td>
                                    <td style={{ padding: 15, textAlign: "center" }}>
                                        <Link to={`/dashboard/org/event/${ev.ID}/manage`} style={{ padding: "6px 12px", background: "#3182ce", color: "white", textDecoration: "none", borderRadius: 4, fontSize: 14 }}>
                                            Kelola
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}