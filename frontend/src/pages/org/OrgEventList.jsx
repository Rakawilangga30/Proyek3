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
            // Ambil report organisasi (total + events with buyers)
            const res = await api.get("/organization/report");
            setEvents(res.data.events || []);
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
                <div>
                    <h2>📊 Report Organisasi</h2>
                    <div style={{ color: "#718096" }}>Report kosong</div>
                </div>
                <div>
                    <Link to="/dashboard/org" style={{ padding: "10px 15px", background: "#edf2f7", color: "#2d3748", textDecoration: "none", borderRadius: 5 }}>Dashboard Org</Link>
                </div>
            </div>

            <div style={{ padding: 40, background: "white", borderRadius: 8, border: "1px dashed #e2e8f0", minHeight: 240 }}>
                {/* Blank report area as requested */}
            </div>
        </div>
    );
}